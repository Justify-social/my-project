/**
 * Redis Multi-Region Replication Configuration
 * 
 * This module implements a sophisticated multi-region caching strategy with 
 * latency-based routing and optimized replication patterns.
 */

// Define the replication topology
locals {
  // Primary region (source of truth)
  primary_region = var.primary_region
  
  // Calculate cache node distribution based on access patterns
  regional_weight_map = {
    for region in var.replica_regions : region => (
      var.regional_access_patterns[region] / 
      sum([for r in var.replica_regions : var.regional_access_patterns[r]])
    )
  }
  
  // Minimum nodes per region to maintain availability
  min_nodes_per_region = 3
  
  // Calculate optimal node distribution using weighted allocation
  regional_node_allocation = {
    for region, weight in local.regional_weight_map : region => max(
      local.min_nodes_per_region,
      floor(var.total_cache_nodes * weight)
    )
  }
  
  // Normalize node allocation to match total node count
  allocated_nodes = sum([for region, count in local.regional_node_allocation : count])
  adjustment_factor = var.total_cache_nodes / local.allocated_nodes
  
  normalized_node_allocation = {
    for region, count in local.regional_node_allocation : region => 
      floor(count * local.adjustment_factor)
  }
  
  // Calculate replication lag tolerance based on data volatility
  replication_lag_tolerance_ms = min(
    var.max_acceptable_lag_ms,
    var.data_volatility_factor * var.avg_transaction_time_ms
  )
  
  // Calculate consistency probability with given replication strategy
  // Based on mathematical model derived from the CAP theorem
  consistency_probability = 1.0 - (
    var.network_partition_probability * 
    (1.0 - exp(-1.0 * var.avg_replication_lag_ms / local.replication_lag_tolerance_ms))
  )
}

// Primary Cache Cluster (Source of truth)
resource "aws_elasticache_replication_group" "primary" {
  replication_group_id          = "component-registry-cache-${var.environment}"
  description                   = "Component Registry Cache - Primary (${var.environment})"
  node_type                     = var.cache_node_type
  num_cache_clusters            = var.primary_node_count
  automatic_failover_enabled    = true
  multi_az_enabled              = true
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
  kms_key_id                    = var.kms_key_arn
  subnet_group_name             = var.cache_subnet_group_name
  security_group_ids            = [var.cache_security_group_id]
  parameter_group_name          = aws_elasticache_parameter_group.cache_params.name
  engine_version                = "6.x"
  port                          = 6379
  
  // Set maintenance window during low-traffic periods
  maintenance_window            = "sun:05:00-sun:07:00"
  snapshot_window               = "03:00-05:00"
  snapshot_retention_limit      = 7
  
  // Automatic node replacement
  auto_minor_version_upgrade    = true

  // Configure cluster mode for sharding
  cluster_enabled = true
  
  tags = merge(var.tags, {
    Name        = "component-registry-cache-${var.environment}-primary"
    Region      = var.primary_region
    Role        = "primary"
    ConsistencyModel = "eventual-consistency"
    ConsistencyProbability = format("%.4f", local.consistency_probability)
  })
}

// Parameter group with optimized settings
resource "aws_elasticache_parameter_group" "cache_params" {
  name        = "component-registry-cache-params-${var.environment}"
  family      = "redis6.x"
  description = "Parameters for Component Registry Cache"
  
  // Memory management
  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lfu"  // Least frequently used with expiration
  }
  
  // Persistence configuration
  parameter {
    name  = "appendonly"
    value = "yes"
  }
  
  parameter {
    name  = "appendfsync"
    value = "everysec"  // Balance between performance and durability
  }
  
  // Replication tuning
  parameter {
    name  = "repl-backlog-size"
    value = var.repl_backlog_size
  }
  
  parameter {
    name  = "repl-backlog-ttl"
    value = "3600"  // Keep backlog for 1 hour after disconnect
  }
  
  // Client connection management
  parameter {
    name  = "timeout"
    value = "300"  // 5 minute timeout for idle connections
  }
  
  parameter {
    name  = "tcp-keepalive"
    value = "60"  // Keep-alive every 60 seconds
  }
}

// Secondary regions (cross-region replicas)
resource "aws_elasticache_global_replication_group" "global_cache" {
  count = length(var.replica_regions) > 0 ? 1 : 0
  
  global_replication_group_id_suffix = "component-registry-${var.environment}"
  primary_replication_group_id       = aws_elasticache_replication_group.primary.id
  
  // This handles automatic spread of data to other regions
}

// Regional cache clusters (replicas)
resource "aws_elasticache_replication_group" "regional_replicas" {
  for_each = local.normalized_node_allocation
  
  provider                      = aws.replica_region[each.key]
  replication_group_id          = "component-registry-cache-${var.environment}-${each.key}"
  description                   = "Component Registry Cache - ${each.key} (${var.environment})"
  node_type                     = var.cache_node_type
  num_cache_clusters            = each.value
  automatic_failover_enabled    = true
  multi_az_enabled              = true
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
  subnet_group_name             = var.regional_subnet_groups[each.key]
  security_group_ids            = [var.regional_security_groups[each.key]]
  global_replication_group_id   = aws_elasticache_global_replication_group.global_cache[0].id
  
  // We don't specify these for replica groups as they're inherited
  // from the global replication group
  engine_version                = null
  parameter_group_name          = null
  
  tags = merge(var.tags, {
    Name        = "component-registry-cache-${var.environment}-${each.key}"
    Region      = each.key
    Role        = "replica"
    NodeCount   = each.value
    AccessWeight = format("%.2f", local.regional_weight_map[each.key])
  })
}

// Route 53 Latency-based routing for cache endpoints
resource "aws_route53_record" "cache_endpoints" {
  for_each = merge(
    { var.primary_region = aws_elasticache_replication_group.primary.configuration_endpoint_address },
    { for region, replica in aws_elasticache_replication_group.regional_replicas : 
      region => replica.configuration_endpoint_address 
    }
  )
  
  zone_id  = var.route53_zone_id
  name     = "cache-${var.environment}.${var.domain_name}"
  type     = "CNAME"
  ttl      = 60
  
  // Latency-based routing to direct clients to the nearest cache
  latency_routing_policy {
    region = each.key
  }
  
  // Multi-value answer for fault tolerance
  multivalue_answer_routing_policy = true
  
  records = [each.value]
  
  set_identifier = "cache-${var.environment}-${each.key}"
}

// CloudWatch Alarms for Replication Lag
resource "aws_cloudwatch_metric_alarm" "replication_lag" {
  for_each = aws_elasticache_replication_group.regional_replicas
  
  alarm_name          = "cache-replication-lag-${var.environment}-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "ReplicationLag"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = local.replication_lag_tolerance_ms / 1000 // Convert to seconds
  alarm_description   = "Redis replication lag exceeds tolerance threshold"
  
  dimensions = {
    CacheClusterId = each.value.replication_group_id
  }
  
  alarm_actions = [var.sns_alarm_topic_arn]
  ok_actions    = [var.sns_alarm_topic_arn]
}

// Outputs for cache endpoints
output "primary_endpoint" {
  description = "Primary cache endpoint"
  value       = aws_elasticache_replication_group.primary.configuration_endpoint_address
}

output "regional_endpoints" {
  description = "Regional cache endpoints"
  value = {
    for region, replica in aws_elasticache_replication_group.regional_replicas : 
      region => replica.configuration_endpoint_address
  }
}

output "cache_dns_name" {
  description = "The DNS name for latency-based routing to caches"
  value       = "cache-${var.environment}.${var.domain_name}"
}

output "consistency_probability" {
  description = "Calculated probability of consistency under network partitions"
  value       = local.consistency_probability
}

output "regional_node_allocation" {
  description = "Number of cache nodes allocated to each region"
  value       = local.normalized_node_allocation
} 