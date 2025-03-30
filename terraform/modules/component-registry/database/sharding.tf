/**
 * Database Sharding Configuration
 * 
 * This module implements a mathematically sound sharding strategy for the 
 * component registry database using consistent hashing to ensure optimal 
 * distribution of component data across multiple shards.
 */

variable "shard_count" {
  description = "Number of database shards to create"
  type        = number
  default     = 4

  validation {
    condition     = var.shard_count > 0 && var.shard_count <= 16 && pow(2, floor(log(var.shard_count, 2))) == var.shard_count
    error_message = "Shard count must be a power of 2 between 1 and 16."
  }
}

variable "hash_algorithm" {
  description = "Hash algorithm to use for shard distribution"
  type        = string
  default     = "murmur3"

  validation {
    condition     = contains(["murmur3", "fnv1a", "xxhash"], var.hash_algorithm)
    error_message = "Hash algorithm must be one of: murmur3, fnv1a, xxhash."
  }
}

variable "replication_factor" {
  description = "Number of replicas for each shard (N+1 redundancy)"
  type        = number
  default     = 2

  validation {
    condition     = var.replication_factor >= 1 && var.replication_factor <= 3
    error_message = "Replication factor must be between 1 and 3."
  }
}

// Calculate hash ring parameters
locals {
  // Each shard covers a specific range in the hash space
  hash_space_size       = pow(2, 32) // 32-bit hash space
  points_per_shard      = 256        // Virtual nodes per physical shard for better distribution
  hash_ring_points      = var.shard_count * local.points_per_shard
  virtual_node_spacing  = local.hash_space_size / local.hash_ring_points
  
  // Generate shard ID formatting with appropriate zero-padding
  shard_id_format       = "shard-%0${length(tostring(var.shard_count))}d"
  
  // Redundancy grouping for replication
  replica_groups        = [
    for i in range(var.shard_count) : [
      for j in range(var.replication_factor) : 
        (i + j) % var.shard_count // Distributed replicas across different shards
    ]
  ]
}

// Create the database clusters for each shard
resource "aws_rds_cluster" "component_registry_shards" {
  count = var.shard_count
  
  cluster_identifier  = format(local.shard_id_format, count.index)
  engine              = "aurora-postgresql"
  engine_version      = "13.7"
  database_name       = "component_registry"
  master_username     = var.database_credentials.username
  master_password     = var.database_credentials.password
  
  // Enable storage encryption
  storage_encrypted   = true
  kms_key_id          = var.kms_key_arn
  
  // Backup configuration
  backup_retention_period = 7
  preferred_backup_window = "03:00-05:00"
  
  // Set maintenance window outside of peak hours
  preferred_maintenance_window = "sun:05:00-sun:07:00"
  
  // Enhanced monitoring
  monitoring_interval = 30
  monitoring_role_arn = var.monitoring_role_arn
  
  // Network configuration
  db_subnet_group_name              = var.db_subnet_group_name
  vpc_security_group_ids            = [var.database_security_group_id]
  port                              = 5432
  
  // Make this a multi-AZ deployment for high availability
  availability_zones                = var.availability_zones
  
  // Performance Insights for advanced monitoring
  performance_insights_enabled      = true
  performance_insights_kms_key_id   = var.kms_key_arn
  performance_insights_retention_period = 7
  
  // Apply parameter group with sharding-specific settings
  db_cluster_parameter_group_name   = aws_rds_cluster_parameter_group.shard_parameters[count.index].name
  
  // Shard-specific tags
  tags = {
    Name         = format(local.shard_id_format, count.index)
    ShardIndex   = count.index
    ShardRange   = "${(count.index * local.hash_space_size) / var.shard_count}-${((count.index + 1) * local.hash_space_size / var.shard_count) - 1}"
    HashAlgorithm = var.hash_algorithm
    ReplicaGroup = jsonencode(local.replica_groups[count.index])
  }
}

// Parameter groups for shards with optimized settings
resource "aws_rds_cluster_parameter_group" "shard_parameters" {
  count = var.shard_count
  
  name        = "component-registry-shard-${count.index}-params"
  family      = "aurora-postgresql13"
  description = "Parameter group for component registry shard ${count.index}"
  
  // Set consistency model parameters
  parameter {
    name  = "synchronous_commit"
    value = var.replication_factor > 1 ? "on" : "off"
    apply_method = "pending-reboot"
  }
  
  // Configure shared buffers based on shard size
  parameter {
    name  = "shared_buffers"
    value = "{DBInstanceClassMemory/10240}MB"
    apply_method = "pending-reboot"
  }
  
  // Set work memory based on expected query complexity
  parameter {
    name  = "work_mem"
    value = "16MB"
    apply_method = "pending-reboot"
  }
  
  // Optimize for component metadata storage
  parameter {
    name  = "effective_cache_size"
    value = "{DBInstanceClassMemory/16384}MB"
    apply_method = "pending-reboot"
  }
  
  // Enable parallel query for better performance
  parameter {
    name  = "max_parallel_workers_per_gather"
    value = "4"
    apply_method = "pending-reboot"
  }
  
  // Shard-specific tags
  tags = {
    Name       = "component-registry-shard-${count.index}-params"
    ShardIndex = count.index
  }
}

// Create read replicas for each shard
resource "aws_rds_cluster_instance" "shard_instances" {
  count = var.shard_count * (1 + var.replication_factor)
  
  // Determine which shard and whether this is primary or replica
  local {
    shard_index = floor(count.index / (1 + var.replication_factor))
    is_primary  = count.index % (1 + var.replication_factor) == 0
    replica_index = floor(count.index % (1 + var.replication_factor)) - 1
  }
  
  identifier           = "${format(local.shard_id_format, local.shard_index)}-${local.is_primary ? "primary" : "replica-${local.replica_index}"}"
  cluster_identifier   = aws_rds_cluster.component_registry_shards[local.shard_index].id
  engine               = "aurora-postgresql"
  engine_version       = "13.7"
  instance_class       = local.is_primary ? var.primary_instance_class : var.replica_instance_class
  
  // Enable Performance Insights
  performance_insights_enabled = true
  performance_insights_kms_key_id = var.kms_key_arn
  
  // Enhanced monitoring
  monitoring_interval = 30
  monitoring_role_arn = var.monitoring_role_arn
  
  // Apply instance parameter group
  db_parameter_group_name = aws_db_parameter_group.shard_instance_parameters[local.shard_index].name
  
  // Promote to primary if this is the first instance in the shard
  publicly_accessible    = false
  
  // Apply tags for identification
  tags = {
    Name         = "${format(local.shard_id_format, local.shard_index)}-${local.is_primary ? "primary" : "replica-${local.replica_index}"}"
    ShardIndex   = local.shard_index
    InstanceRole = local.is_primary ? "primary" : "replica"
    ReplicaIndex = local.is_primary ? null : local.replica_index
  }
}

// Instance parameter groups for fine-tuning
resource "aws_db_parameter_group" "shard_instance_parameters" {
  count = var.shard_count
  
  name        = "component-registry-shard-${count.index}-instance-params"
  family      = "aurora-postgresql13"
  description = "Instance parameter group for component registry shard ${count.index}"
  
  // Configure connection handling
  parameter {
    name  = "max_connections"
    value = var.max_connections_per_instance
    apply_method = "pending-reboot"
  }
  
  // Optimize memory usage
  parameter {
    name  = "maintenance_work_mem"
    value = "256MB"
    apply_method = "pending-reboot"
  }
  
  // Set statement timeout to prevent long-running queries
  parameter {
    name  = "statement_timeout"
    value = "30000"  // 30 seconds
    apply_method = "pending-reboot"
  }
  
  tags = {
    Name       = "component-registry-shard-${count.index}-instance-params"
    ShardIndex = count.index
  }
}

// Create the shard map table in DynamoDB for lookups
resource "aws_dynamodb_table" "shard_map" {
  name           = "component-registry-shard-map"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "hash_key"
  
  attribute {
    name = "hash_key"
    type = "N"
  }
  
  // Global secondary index for range queries
  global_secondary_index {
    name               = "shard-index"
    hash_key           = "shard_index"
    projection_type    = "ALL"
  }
  
  attribute {
    name = "shard_index"
    type = "N"
  }
  
  // Point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }
  
  // Server-side encryption
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Name = "component-registry-shard-map"
    Service = "component-registry"
  }
}

// Populate the shard map
resource "null_resource" "populate_shard_map" {
  depends_on = [aws_dynamodb_table.shard_map]
  
  // Use a local-exec provisioner to populate the shard map
  provisioner "local-exec" {
    command = <<-EOT
      # Generate the shard map data
      SHARD_COUNT=${var.shard_count}
      HASH_SPACE_SIZE=${local.hash_space_size}
      
      for i in $(seq 0 $((SHARD_COUNT-1))); do
        START_RANGE=$((i * HASH_SPACE_SIZE / SHARD_COUNT))
        END_RANGE=$(((i+1) * HASH_SPACE_SIZE / SHARD_COUNT - 1))
        
        # Get the cluster endpoint for this shard
        CLUSTER_ENDPOINT=$(aws rds describe-db-clusters --db-cluster-identifier "shard-$i" --query "DBClusters[0].Endpoint" --output text)
        READER_ENDPOINT=$(aws rds describe-db-clusters --db-cluster-identifier "shard-$i" --query "DBClusters[0].ReaderEndpoint" --output text)
        
        # Create the shard map entry
        aws dynamodb put-item \
          --table-name component-registry-shard-map \
          --item "{
            \"hash_key\": {\"N\": \"$i\"},
            \"shard_index\": {\"N\": \"$i\"},
            \"start_range\": {\"N\": \"$START_RANGE\"},
            \"end_range\": {\"N\": \"$END_RANGE\"},
            \"primary_endpoint\": {\"S\": \"$CLUSTER_ENDPOINT\"},
            \"reader_endpoint\": {\"S\": \"$READER_ENDPOINT\"},
            \"status\": {\"S\": \"active\"}
          }"
      done
    EOT
  }
}

// Outputs for use in other modules
output "shard_cluster_endpoints" {
  description = "Endpoints for all shard clusters"
  value = {
    for i, cluster in aws_rds_cluster.component_registry_shards : i => {
      primary_endpoint = cluster.endpoint
      reader_endpoint  = cluster.reader_endpoint
      port             = cluster.port
    }
  }
}

output "shard_map_table_name" {
  description = "Name of the DynamoDB table containing the shard map"
  value       = aws_dynamodb_table.shard_map.name
}

output "shard_count" {
  description = "Number of shards in the configuration"
  value       = var.shard_count
}

output "hash_algorithm" {
  description = "Hash algorithm used for consistent hashing"
  value       = var.hash_algorithm
}

output "replication_factor" {
  description = "Replication factor for each shard"
  value       = var.replication_factor
} 