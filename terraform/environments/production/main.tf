/**
 * UI Component Library - Production Environment
 * 
 * This is the main Terraform configuration for the production environment,
 * orchestrating all modules to create a complete, scalable deployment.
 */

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket         = "ui-component-library-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "ui-component-library-terraform-locks"
    encrypt        = true
  }
}

# Provider configuration for primary region
provider "aws" {
  region = var.primary_region
  
  default_tags {
    tags = {
      Environment  = "production"
      Project      = "ui-component-library"
      ManagedBy    = "terraform"
      Version      = var.app_version
    }
  }
}

# Provider configurations for replica regions
provider "aws" {
  alias  = "us-west-2"
  region = "us-west-2"
  
  default_tags {
    tags = {
      Environment  = "production"
      Project      = "ui-component-library"
      ManagedBy    = "terraform"
      Version      = var.app_version
    }
  }
}

provider "aws" {
  alias  = "eu-west-1"
  region = "eu-west-1"
  
  default_tags {
    tags = {
      Environment  = "production"
      Project      = "ui-component-library"
      ManagedBy    = "terraform"
      Version      = var.app_version
    }
  }
}

# Map of regional providers for dynamic reference
locals {
  regional_providers = {
    "us-west-2" = aws.us-west-2
    "eu-west-1" = aws.eu-west-1
  }
  
  common_tags = {
    Environment  = "production"
    Project      = "ui-component-library"
    ManagedBy    = "terraform"
    Version      = var.app_version
  }
}

# VPC Module
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "3.14.0"

  name = "component-registry-${var.environment}"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
  database_subnets = var.database_subnet_cidrs
  elasticache_subnets = var.elasticache_subnet_cidrs

  enable_nat_gateway = true
  single_nat_gateway = false
  one_nat_gateway_per_az = true

  enable_vpn_gateway = false

  enable_dns_hostnames = true
  enable_dns_support   = true

  # Create subnet groups for RDS and ElastiCache
  create_database_subnet_group = true
  create_elasticache_subnet_group = true

  tags = local.common_tags
}

# Regional VPCs for multi-region deployment
module "replica_vpcs" {
  for_each = toset(var.replica_regions)
  
  source = "terraform-aws-modules/vpc/aws"
  version = "3.14.0"
  
  providers = {
    aws = local.regional_providers[each.key]
  }

  name = "component-registry-${var.environment}-${each.key}"
  cidr = var.replica_vpc_cidrs[each.key]

  azs             = var.replica_availability_zones[each.key]
  private_subnets = var.replica_private_subnet_cidrs[each.key]
  public_subnets  = var.replica_public_subnet_cidrs[each.key]
  database_subnets = var.replica_database_subnet_cidrs[each.key]
  elasticache_subnets = var.replica_elasticache_subnet_cidrs[each.key]

  enable_nat_gateway = true
  single_nat_gateway = false
  one_nat_gateway_per_az = true

  enable_vpn_gateway = false

  enable_dns_hostnames = true
  enable_dns_support   = true

  # Create subnet groups for RDS and ElastiCache
  create_database_subnet_group = true
  create_elasticache_subnet_group = true

  tags = merge(local.common_tags, {
    Region = each.key
  })
}

# KMS Keys for encryption
resource "aws_kms_key" "encryption_key" {
  description             = "KMS key for encrypting component registry data"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  
  tags = local.common_tags
}

# Regional KMS keys for replica regions
resource "aws_kms_key" "regional_encryption_keys" {
  for_each = toset(var.replica_regions)
  
  provider = local.regional_providers[each.key]
  
  description             = "KMS key for encrypting component registry data in ${each.key}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  
  tags = merge(local.common_tags, {
    Region = each.key
  })
}

# Security Groups
resource "aws_security_group" "database" {
  name        = "component-registry-db-${var.environment}"
  description = "Security group for component registry database"
  vpc_id      = module.vpc.vpc_id

  # Allow inbound traffic from application security group
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.application.id]
  }
  
  # Allow internal communication between shards
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    self            = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "component-registry-db-${var.environment}"
  })
}

resource "aws_security_group" "cache" {
  name        = "component-registry-cache-${var.environment}"
  description = "Security group for component registry cache"
  vpc_id      = module.vpc.vpc_id

  # Allow inbound traffic from application security group
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.application.id]
  }
  
  # Allow internal communication between cluster nodes
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    self            = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "component-registry-cache-${var.environment}"
  })
}

resource "aws_security_group" "application" {
  name        = "component-registry-app-${var.environment}"
  description = "Security group for component registry application"
  vpc_id      = module.vpc.vpc_id

  # Allow inbound HTTP/HTTPS traffic
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Allow inbound traffic for health checks
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "component-registry-app-${var.environment}"
  })
}

# Regional security groups for replica regions
resource "aws_security_group" "regional_database" {
  for_each = toset(var.replica_regions)
  
  provider = local.regional_providers[each.key]
  
  name        = "component-registry-db-${var.environment}-${each.key}"
  description = "Security group for component registry database in ${each.key}"
  vpc_id      = module.replica_vpcs[each.key].vpc_id

  # Allow inbound traffic from application security group
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.regional_application[each.key].id]
  }
  
  # Allow internal communication between shards
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    self            = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "component-registry-db-${var.environment}-${each.key}"
    Region = each.key
  })
}

resource "aws_security_group" "regional_cache" {
  for_each = toset(var.replica_regions)
  
  provider = local.regional_providers[each.key]
  
  name        = "component-registry-cache-${var.environment}-${each.key}"
  description = "Security group for component registry cache in ${each.key}"
  vpc_id      = module.replica_vpcs[each.key].vpc_id

  # Allow inbound traffic from application security group
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.regional_application[each.key].id]
  }
  
  # Allow internal communication between cluster nodes
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    self            = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "component-registry-cache-${var.environment}-${each.key}"
    Region = each.key
  })
}

resource "aws_security_group" "regional_application" {
  for_each = toset(var.replica_regions)
  
  provider = local.regional_providers[each.key]
  
  name        = "component-registry-app-${var.environment}-${each.key}"
  description = "Security group for component registry application in ${each.key}"
  vpc_id      = module.replica_vpcs[each.key].vpc_id

  # Allow inbound HTTP/HTTPS traffic
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Allow inbound traffic for health checks
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "component-registry-app-${var.environment}-${each.key}"
    Region = each.key
  })
}

# IAM Role for enhanced monitoring
resource "aws_iam_role" "monitoring_role" {
  name = "component-registry-monitoring-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      },
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "monitoring_policy" {
  role       = aws_iam_role.monitoring_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# SNS Topic for alarms
resource "aws_sns_topic" "alerts" {
  name = "component-registry-alerts-${var.environment}"
  
  tags = local.common_tags
}

# Component Registry Database Module
module "component_registry_database" {
  source = "../../modules/component-registry/database"

  environment = var.environment
  
  database_credentials = {
    username = var.db_username
    password = var.db_password
  }
  
  availability_zones = var.availability_zones
  db_subnet_group_name = module.vpc.database_subnet_group_name
  database_security_group_id = aws_security_group.database.id
  kms_key_arn = aws_kms_key.encryption_key.arn
  monitoring_role_arn = aws_iam_role.monitoring_role.arn
  
  # Sharding configuration
  shard_count = var.db_shard_count
  hash_algorithm = "murmur3"
  replication_factor = var.db_replication_factor
  
  # Instance configuration
  primary_instance_class = "db.r6g.2xlarge"
  replica_instance_class = "db.r6g.large"
  max_connections_per_instance = 2000
  
  # Backup configuration
  backup_retention_days = 14
  
  # Performance configuration
  enable_performance_insights = true
  
  tags = local.common_tags
}

# Component Registry Cache Module
module "component_registry_cache" {
  source = "../../modules/component-registry/caching"

  environment = var.environment
  
  # Region configuration
  primary_region = var.primary_region
  replica_regions = var.replica_regions
  
  regional_access_patterns = var.regional_access_patterns
  
  # Node allocation
  total_cache_nodes = var.cache_total_nodes
  primary_node_count = var.cache_primary_nodes
  
  # Instance configuration
  cache_node_type = "cache.r6g.large"
  
  # Network configuration
  cache_subnet_group_name = module.vpc.elasticache_subnet_group_name
  regional_subnet_groups = {
    for region in var.replica_regions :
    region => module.replica_vpcs[region].elasticache_subnet_group_name
  }
  
  cache_security_group_id = aws_security_group.cache.id
  regional_security_groups = {
    for region in var.replica_regions :
    region => aws_security_group.regional_cache[region].id
  }
  
  # Encryption configuration
  kms_key_arn = aws_kms_key.encryption_key.arn
  
  # DNS configuration
  route53_zone_id = aws_route53_zone.main.zone_id
  domain_name = var.domain_name
  
  # Monitoring configuration
  sns_alarm_topic_arn = aws_sns_topic.alerts.arn
  
  # Replication configuration
  repl_backlog_size = "1GB"
  
  # CAP theorem parameters
  network_partition_probability = 0.005  // 0.5% chance
  avg_replication_lag_ms = 80  // 80ms average lag
  max_acceptable_lag_ms = 500  // 500ms maximum acceptable lag
  data_volatility_factor = 4  // Moderate data volatility
  avg_transaction_time_ms = 30  // 30ms average transaction time
  
  # Advanced parameters
  enable_transit_encryption = true
  enable_cluster_mode = true
  snapshot_retention_days = 14
  eviction_policy = "volatile-lfu"
  
  tags = local.common_tags
}

# Route 53 hosted zone
resource "aws_route53_zone" "main" {
  name = var.domain_name
  
  tags = local.common_tags
}

# ECS Cluster for application
resource "aws_ecs_cluster" "app_cluster" {
  name = "component-registry-${var.environment}"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = local.common_tags
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_execution_role" {
  name = "component-registry-ecs-execution-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Role
resource "aws_iam_role" "ecs_task_role" {
  name = "component-registry-ecs-task-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

# Custom policy for task role
resource "aws_iam_policy" "component_registry_policy" {
  name        = "component-registry-task-policy-${var.environment}"
  description = "Policy for Component Registry application"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          module.component_registry_database.shard_map_table_name
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = [
          aws_kms_key.encryption_key.arn
        ]
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "ecs_task_role_policy" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.component_registry_policy.arn
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "component-registry-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "2048"
  memory                   = "4096"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  
  container_definitions = jsonencode([
    {
      name      = "component-registry"
      image     = "${var.ecr_repository_url}:${var.app_version}"
      essential = true
      
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DB_SHARD_COUNT"
          value = tostring(var.db_shard_count)
        },
        {
          name  = "DB_SHARD_MAP_TABLE"
          value = module.component_registry_database.shard_map_table_name
        },
        {
          name  = "REDIS_URL"
          value = "redis://${module.component_registry_cache.cache_dns_name}:6379"
        },
        {
          name  = "HASH_ALGORITHM"
          value = module.component_registry_database.hash_algorithm
        }
      ]
      
      secrets = [
        {
          name      = "DB_PASSWORD"
          valueFrom = aws_secretsmanager_secret.db_password.arn
        }
      ]
      
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app_logs.name
          "awslogs-region"        = var.primary_region
          "awslogs-stream-prefix" = "component-registry"
        }
      }
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
  
  tags = local.common_tags
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/ecs/component-registry-${var.environment}"
  retention_in_days = 14
  
  tags = local.common_tags
}

# Secrets Manager for database password
resource "aws_secretsmanager_secret" "db_password" {
  name        = "component-registry/db-password-${var.environment}"
  description = "Database password for Component Registry"
  kms_key_id  = aws_kms_key.encryption_key.arn
  
  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

# Application Load Balancer
resource "aws_lb" "app" {
  name               = "component-registry-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.application.id]
  subnets            = module.vpc.public_subnets
  
  enable_deletion_protection = true
  
  tags = local.common_tags
}

resource "aws_lb_target_group" "app" {
  name        = "component-registry-tg-${var.environment}"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"
  
  health_check {
    path                = "/health"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
  
  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }
  
  tags = local.common_tags
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.cert.arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
  
  tags = local.common_tags
}

resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.app.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
  
  tags = local.common_tags
}

# ACM Certificate
resource "aws_acm_certificate" "cert" {
  domain_name       = "component-registry.${var.domain_name}"
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = local.common_tags
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# Route 53 record for application
resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "component-registry.${var.domain_name}"
  type    = "A"
  
  alias {
    name                   = aws_lb.app.dns_name
    zone_id                = aws_lb.app.zone_id
    evaluate_target_health = true
  }
}

# ECS Service
resource "aws_ecs_service" "app" {
  name            = "component-registry-${var.environment}"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app.arn
  launch_type     = "FARGATE"
  desired_count   = var.app_desired_count
  
  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.application.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "component-registry"
    container_port   = 8080
  }
  
  deployment_controller {
    type = "CODE_DEPLOY"
  }
  
  # Steady state deployment configuration (without actual CodeDeploy)
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100
  health_check_grace_period_seconds  = 120
  
  # Blue-green deployment requires not setting the deployment_controller type to "CODE_DEPLOY"
  # but we're using CodeDeploy for advanced deployment strategies
  lifecycle {
    ignore_changes = [
      task_definition,
      load_balancer
    ]
  }
  
  tags = local.common_tags
}

# Auto Scaling for ECS Service
resource "aws_appautoscaling_target" "app" {
  max_capacity       = var.app_max_count
  min_capacity       = var.app_min_count
  resource_id        = "service/${aws_ecs_cluster.app_cluster.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "app_cpu" {
  name               = "component-registry-cpu-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.app.resource_id
  scalable_dimension = aws_appautoscaling_target.app.scalable_dimension
  service_namespace  = aws_appautoscaling_target.app.service_namespace
  
  target_tracking_scaling_policy_configuration {
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
    
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "app_memory" {
  name               = "component-registry-memory-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.app.resource_id
  scalable_dimension = aws_appautoscaling_target.app.scalable_dimension
  service_namespace  = aws_appautoscaling_target.app.service_namespace
  
  target_tracking_scaling_policy_configuration {
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
    
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
  }
}

# Outputs
output "database_endpoints" {
  description = "Database endpoints for all shards"
  value       = module.component_registry_database.shard_cluster_endpoints
  sensitive   = true
}

output "cache_endpoints" {
  description = "Cache endpoints for all regions"
  value = {
    primary = module.component_registry_cache.primary_endpoint
    regional = module.component_registry_cache.regional_endpoints
    dns = module.component_registry_cache.cache_dns_name
  }
}

output "application_url" {
  description = "URL of the deployed application"
  value       = "https://${aws_route53_record.app.name}"
}

output "consistency_probability" {
  description = "Calculated probability of cache consistency under network partitions"
  value       = module.component_registry_cache.consistency_probability
} 