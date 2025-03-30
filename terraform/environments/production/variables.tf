/**
 * UI Component Library - Production Environment Variables
 * 
 * This file defines all variables used in the production environment configuration.
 */

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "primary_region" {
  description = "AWS region for primary deployment"
  type        = string
  default     = "us-east-1"
}

variable "replica_regions" {
  description = "List of AWS regions for replica deployments"
  type        = list(string)
  default     = ["us-west-2", "eu-west-1"]
}

variable "app_version" {
  description = "Version of the application to deploy"
  type        = string
}

# VPC Configuration - Primary Region
variable "vpc_cidr" {
  description = "CIDR block for the primary VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones in the primary region"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets in primary region"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets in primary region"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets in primary region"
  type        = list(string)
  default     = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
}

variable "elasticache_subnet_cidrs" {
  description = "CIDR blocks for elasticache subnets in primary region"
  type        = list(string)
  default     = ["10.0.251.0/24", "10.0.252.0/24", "10.0.253.0/24"]
}

# VPC Configuration - Replica Regions
variable "replica_vpc_cidrs" {
  description = "Map of CIDR blocks for replica VPCs by region"
  type        = map(string)
  default     = {
    "us-west-2" = "10.1.0.0/16"
    "eu-west-1" = "10.2.0.0/16"
  }
}

variable "replica_availability_zones" {
  description = "Map of availability zones by replica region"
  type        = map(list(string))
  default     = {
    "us-west-2" = ["us-west-2a", "us-west-2b", "us-west-2c"]
    "eu-west-1" = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  }
}

variable "replica_private_subnet_cidrs" {
  description = "Map of CIDR blocks for private subnets by replica region"
  type        = map(list(string))
  default     = {
    "us-west-2" = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
    "eu-west-1" = ["10.2.1.0/24", "10.2.2.0/24", "10.2.3.0/24"]
  }
}

variable "replica_public_subnet_cidrs" {
  description = "Map of CIDR blocks for public subnets by replica region"
  type        = map(list(string))
  default     = {
    "us-west-2" = ["10.1.101.0/24", "10.1.102.0/24", "10.1.103.0/24"]
    "eu-west-1" = ["10.2.101.0/24", "10.2.102.0/24", "10.2.103.0/24"]
  }
}

variable "replica_database_subnet_cidrs" {
  description = "Map of CIDR blocks for database subnets by replica region"
  type        = map(list(string))
  default     = {
    "us-west-2" = ["10.1.201.0/24", "10.1.202.0/24", "10.1.203.0/24"]
    "eu-west-1" = ["10.2.201.0/24", "10.2.202.0/24", "10.2.203.0/24"]
  }
}

variable "replica_elasticache_subnet_cidrs" {
  description = "Map of CIDR blocks for elasticache subnets by replica region"
  type        = map(list(string))
  default     = {
    "us-west-2" = ["10.1.251.0/24", "10.1.252.0/24", "10.1.253.0/24"]
    "eu-west-1" = ["10.2.251.0/24", "10.2.252.0/24", "10.2.253.0/24"]
  }
}

# Database Configuration
variable "db_username" {
  description = "Master username for database"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Master password for database"
  type        = string
  sensitive   = true
}

variable "db_shard_count" {
  description = "Number of database shards"
  type        = number
  default     = 8
  
  validation {
    condition     = var.db_shard_count > 0 && var.db_shard_count <= 16 && pow(2, floor(log(var.db_shard_count, 2))) == var.db_shard_count
    error_message = "The db_shard_count must be a power of 2 between 1 and 16."
  }
}

variable "db_replication_factor" {
  description = "Number of replicas for each shard"
  type        = number
  default     = 2
  
  validation {
    condition     = var.db_replication_factor >= 1 && var.db_replication_factor <= 3
    error_message = "The db_replication_factor must be between 1 and 3."
  }
}

# Cache Configuration
variable "cache_total_nodes" {
  description = "Total number of cache nodes across all regions"
  type        = number
  default     = 12
  
  validation {
    condition     = var.cache_total_nodes >= 6
    error_message = "The cache_total_nodes must be at least 6 for high availability."
  }
}

variable "cache_primary_nodes" {
  description = "Number of cache nodes in the primary region"
  type        = number
  default     = 6
  
  validation {
    condition     = var.cache_primary_nodes >= 3
    error_message = "The cache_primary_nodes must be at least 3 for high availability."
  }
}

variable "regional_access_patterns" {
  description = "Map of regions to their relative access frequency"
  type        = map(number)
  default     = {
    "us-east-1" = 100
    "us-west-2" = 60
    "eu-west-1" = 40
  }
  
  validation {
    condition     = alltrue([for v in values(var.regional_access_patterns) : v >= 0])
    error_message = "All regional access pattern values must be non-negative."
  }
}

# Application Configuration
variable "app_desired_count" {
  description = "Desired number of application instances"
  type        = number
  default     = 4
  
  validation {
    condition     = var.app_desired_count >= 2
    error_message = "The app_desired_count must be at least 2 for high availability."
  }
}

variable "app_min_count" {
  description = "Minimum number of application instances"
  type        = number
  default     = 2
  
  validation {
    condition     = var.app_min_count >= 2
    error_message = "The app_min_count must be at least 2 for high availability."
  }
}

variable "app_max_count" {
  description = "Maximum number of application instances"
  type        = number
  default     = 12
  
  validation {
    condition     = var.app_max_count >= var.app_min_count
    error_message = "The app_max_count must be greater than or equal to app_min_count."
  }
}

variable "ecr_repository_url" {
  description = "ECR repository URL for application image"
  type        = string
}

# DNS Configuration
variable "domain_name" {
  description = "Base domain name for the application"
  type        = string
  default     = "ui-component-library.example.com"
}

# Tags
variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
} 