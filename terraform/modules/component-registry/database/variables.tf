/**
 * Database Module Variables
 * 
 * This file defines all the input variables for the database module,
 * including credentials, network settings, and instance specifications.
 */

variable "environment" {
  description = "Deployment environment (dev, staging, production)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "database_credentials" {
  description = "Credentials for the database"
  type = object({
    username = string
    password = string
  })
  
  sensitive = true
  
  validation {
    condition     = length(var.database_credentials.username) >= 4
    error_message = "Username must be at least 4 characters."
  }
  
  validation {
    condition     = length(var.database_credentials.password) >= 16
    error_message = "Password must be at least 16 characters."
  }
}

variable "availability_zones" {
  description = "List of availability zones to deploy across"
  type        = list(string)
  
  validation {
    condition     = length(var.availability_zones) >= 3
    error_message = "At least 3 availability zones are required for high availability."
  }
}

variable "db_subnet_group_name" {
  description = "Name of the DB subnet group"
  type        = string
}

variable "database_security_group_id" {
  description = "ID of the security group for database access"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN of the KMS key for encryption"
  type        = string
}

variable "monitoring_role_arn" {
  description = "ARN of the IAM role for enhanced monitoring"
  type        = string
}

variable "primary_instance_class" {
  description = "Instance class for primary database instances"
  type        = string
  default     = "db.r6g.2xlarge"
  
  validation {
    condition     = can(regex("^db\\.(t3|r5|r6g|x2g)\\.", var.primary_instance_class))
    error_message = "Primary instance class must be a valid RDS instance type."
  }
}

variable "replica_instance_class" {
  description = "Instance class for replica database instances"
  type        = string
  default     = "db.r6g.large"
  
  validation {
    condition     = can(regex("^db\\.(t3|r5|r6g|x2g)\\.", var.replica_instance_class))
    error_message = "Replica instance class must be a valid RDS instance type."
  }
}

variable "max_connections_per_instance" {
  description = "Maximum number of connections per database instance"
  type        = number
  default     = 1000
  
  validation {
    condition     = var.max_connections_per_instance >= 100 && var.max_connections_per_instance <= 5000
    error_message = "Max connections must be between 100 and 5000."
  }
}

variable "backup_retention_days" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 7
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 35
    error_message = "Backup retention must be between 1 and 35 days."
  }
}

variable "component_registry_schema" {
  description = "Path to the SQL schema file for component registry database"
  type        = string
  default     = "schema/component_registry.sql"
}

variable "enable_performance_insights" {
  description = "Whether to enable Performance Insights"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Additional variables not directly referenced in sharding.tf but needed by other files
variable "snapshot_identifier" {
  description = "DB snapshot to restore from (optional)"
  type        = string
  default     = null
}

variable "enable_replica_scaling" {
  description = "Whether to enable auto-scaling for read replicas"
  type        = bool
  default     = true
}

variable "min_replica_count" {
  description = "Minimum number of read replicas per shard when auto-scaling is enabled"
  type        = number
  default     = 1
  
  validation {
    condition     = var.min_replica_count >= 1 && var.min_replica_count <= 15
    error_message = "Minimum replica count must be between 1 and 15."
  }
}

variable "max_replica_count" {
  description = "Maximum number of read replicas per shard when auto-scaling is enabled"
  type        = number
  default     = 5
  
  validation {
    condition     = var.max_replica_count >= 1 && var.max_replica_count <= 15
    error_message = "Maximum replica count must be between 1 and 15."
  }
}

variable "cpu_utilization_threshold" {
  description = "CPU utilization percentage to trigger scaling (1-100)"
  type        = number
  default     = 70
  
  validation {
    condition     = var.cpu_utilization_threshold > 0 && var.cpu_utilization_threshold <= 100
    error_message = "CPU utilization threshold must be between 1 and 100."
  }
}

variable "connection_threshold" {
  description = "Connection count to trigger scaling"
  type        = number
  default     = 800
  
  validation {
    condition     = var.connection_threshold >= 10
    error_message = "Connection threshold must be at least 10."
  }
} 