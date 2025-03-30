/**
 * Caching Module Variables
 * 
 * This file defines all the input variables for the caching module,
 * including multi-region replication settings and performance parameters.
 */

variable "environment" {
  description = "Deployment environment (dev, staging, production)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "primary_region" {
  description = "Primary AWS region for cache clusters"
  type        = string
}

variable "replica_regions" {
  description = "List of AWS regions for replica cache clusters"
  type        = list(string)
  default     = []
}

variable "regional_access_patterns" {
  description = "Map of regions to their relative access frequency (higher number = more requests)"
  type        = map(number)
  default     = {}
  
  validation {
    condition     = length([for v in values(var.regional_access_patterns) : v if v < 0]) == 0
    error_message = "All regional access pattern values must be non-negative."
  }
}

variable "total_cache_nodes" {
  description = "Total number of cache nodes to distribute across regions"
  type        = number
  default     = 12
  
  validation {
    condition     = var.total_cache_nodes >= 6
    error_message = "Total cache nodes must be at least 6 for high availability."
  }
}

variable "primary_node_count" {
  description = "Number of nodes in the primary region cache cluster"
  type        = number
  default     = 3
  
  validation {
    condition     = var.primary_node_count >= 3
    error_message = "Primary node count must be at least 3 for high availability."
  }
}

variable "cache_node_type" {
  description = "ElastiCache instance type for cache nodes"
  type        = string
  default     = "cache.r6g.large"
  
  validation {
    condition     = can(regex("^cache\\.(t3|r5|r6g|m5|m6g)\\.", var.cache_node_type))
    error_message = "Cache node type must be a valid ElastiCache instance type."
  }
}

variable "kms_key_arn" {
  description = "ARN of the KMS key for encryption"
  type        = string
}

variable "cache_subnet_group_name" {
  description = "Name of the subnet group for the primary cache cluster"
  type        = string
}

variable "regional_subnet_groups" {
  description = "Map of regions to their respective cache subnet group names"
  type        = map(string)
  default     = {}
}

variable "cache_security_group_id" {
  description = "ID of the security group for primary cache access"
  type        = string
}

variable "regional_security_groups" {
  description = "Map of regions to their respective cache security group IDs"
  type        = map(string)
  default     = {}
}

variable "repl_backlog_size" {
  description = "Size of the replication backlog in MB"
  type        = string
  default     = "512MB"
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for DNS records"
  type        = string
}

variable "domain_name" {
  description = "Domain name for DNS records"
  type        = string
}

variable "sns_alarm_topic_arn" {
  description = "ARN of the SNS topic for alarms"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# CAP Theorem and Consistency Parameters

variable "network_partition_probability" {
  description = "Probability of network partitions between regions (0.0-1.0)"
  type        = number
  default     = 0.01  // 1% chance of partition
  
  validation {
    condition     = var.network_partition_probability >= 0 && var.network_partition_probability <= 1
    error_message = "Network partition probability must be between 0 and 1."
  }
}

variable "avg_replication_lag_ms" {
  description = "Average replication lag in milliseconds between regions"
  type        = number
  default     = 100  // 100ms typical cross-region lag
  
  validation {
    condition     = var.avg_replication_lag_ms >= 0
    error_message = "Average replication lag must be non-negative."
  }
}

variable "max_acceptable_lag_ms" {
  description = "Maximum acceptable replication lag in milliseconds"
  type        = number
  default     = 1000  // 1 second maximum lag
  
  validation {
    condition     = var.max_acceptable_lag_ms >= 0
    error_message = "Maximum acceptable lag must be non-negative."
  }
}

variable "data_volatility_factor" {
  description = "Factor representing data volatility (higher = more volatile)"
  type        = number
  default     = 5  // Moderate volatility
  
  validation {
    condition     = var.data_volatility_factor >= 1
    error_message = "Data volatility factor must be at least 1."
  }
}

variable "avg_transaction_time_ms" {
  description = "Average transaction processing time in milliseconds"
  type        = number
  default     = 50  // 50ms typical transaction time
  
  validation {
    condition     = var.avg_transaction_time_ms > 0
    error_message = "Average transaction time must be greater than 0."
  }
}

# Advanced Caching Parameters

variable "enable_transit_encryption" {
  description = "Whether to enable transit encryption for Redis"
  type        = bool
  default     = true
}

variable "enable_cluster_mode" {
  description = "Whether to enable Redis cluster mode for sharding"
  type        = bool
  default     = true
}

variable "snapshot_retention_days" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 7
  
  validation {
    condition     = var.snapshot_retention_days >= 0 && var.snapshot_retention_days <= 35
    error_message = "Snapshot retention must be between 0 and 35 days."
  }
}

variable "eviction_policy" {
  description = "Cache eviction policy"
  type        = string
  default     = "volatile-lfu"
  
  validation {
    condition     = contains(["noeviction", "allkeys-lru", "volatile-lru", "allkeys-lfu", "volatile-lfu", "allkeys-random", "volatile-random", "volatile-ttl"], var.eviction_policy)
    error_message = "Eviction policy must be a valid Redis eviction policy."
  }
} 