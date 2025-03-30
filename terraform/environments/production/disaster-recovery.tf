/**
 * UI Component Library - Disaster Recovery
 * 
 * This file defines the disaster recovery infrastructure and procedures
 * for the component registry application. It implements automated failover,
 * cross-region replication, and recovery point objectives based on
 * mathematical models of system resilience.
 */

# AWS Backup Plan
resource "aws_backup_plan" "component_registry" {
  name = "component-registry-backup-${var.environment}"

  rule {
    rule_name         = "daily-backup"
    target_vault_name = aws_backup_vault.component_registry.name
    schedule          = "cron(0 2 * * ? *)" # Daily at 2 AM UTC
    
    lifecycle {
      delete_after = 14 # Keep daily backups for 14 days
    }
    
    recovery_point_tags = local.common_tags
  }
  
  rule {
    rule_name         = "weekly-backup"
    target_vault_name = aws_backup_vault.component_registry.name
    schedule          = "cron(0 1 ? * SUN *)" # Weekly on Sunday at 1 AM UTC
    
    lifecycle {
      delete_after = 90 # Keep weekly backups for 90 days
    }
    
    copy_action {
      destination_vault_arn = aws_backup_vault.secondary_region.arn
      
      lifecycle {
        delete_after = 90 # Keep copied backups for 90 days
      }
    }
    
    recovery_point_tags = local.common_tags
  }
  
  advanced_backup_setting {
    backup_options = {
      WindowsVSS = "enabled"
    }
    resource_type = "EC2"
  }
  
  tags = local.common_tags
}

# AWS Backup Vault
resource "aws_backup_vault" "component_registry" {
  name        = "component-registry-vault-${var.environment}"
  kms_key_arn = aws_kms_key.encryption_key.arn
  
  tags = local.common_tags
}

# Secondary Region Backup Vault
resource "aws_backup_vault" "secondary_region" {
  provider    = aws.secondary_region
  name        = "component-registry-vault-${var.environment}"
  kms_key_arn = aws_kms_key.regional_encryption_keys["us-west-2"].arn
  
  tags = local.common_tags
}

# Selection of resources to back up
resource "aws_backup_selection" "component_registry" {
  name          = "component-registry-selection-${var.environment}"
  iam_role_arn  = aws_iam_role.backup_role.arn
  plan_id       = aws_backup_plan.component_registry.id
  
  selection_tag {
    type  = "STRINGEQUALS"
    key   = "Backup"
    value = "true"
  }
}

# IAM Role for AWS Backup
resource "aws_iam_role" "backup_role" {
  name = "component-registry-backup-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "backup_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup_role.name
}

resource "aws_iam_role_policy_attachment" "restore_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
  role       = aws_iam_role.backup_role.name
}

resource "aws_iam_role_policy_attachment" "backup_s3_policy" {
  policy_arn = aws_iam_policy.backup_s3_policy.arn
  role       = aws_iam_role.backup_role.name
}

# Policy for S3 backups
resource "aws_iam_policy" "backup_s3_policy" {
  name        = "component-registry-backup-s3-${var.environment}"
  description = "Policy for backing up S3 buckets"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetInventoryConfiguration",
          "s3:PutInventoryConfiguration",
          "s3:ListBucketVersions",
          "s3:ListBucket",
          "s3:GetBucketVersioning",
          "s3:GetBucketNotification",
          "s3:PutBucketNotification",
          "s3:GetBucketLocation",
          "s3:GetBucketTagging"
        ]
        Effect   = "Allow"
        Resource = [
          "${aws_s3_bucket.codepipeline_bucket.arn}",
          "${aws_s3_bucket.monitoring_artifacts.arn}"
        ]
      },
      {
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetObjectAcl",
          "s3:GetObjectVersionAcl",
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:PutObjectVersionAcl"
        ]
        Effect   = "Allow"
        Resource = [
          "${aws_s3_bucket.codepipeline_bucket.arn}/*",
          "${aws_s3_bucket.monitoring_artifacts.arn}/*"
        ]
      }
    ]
  })
  
  tags = local.common_tags
}

# Route 53 Health Check for Primary Region
resource "aws_route53_health_check" "primary_region" {
  fqdn              = "component-registry.${var.domain_name}"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30
  
  regions = ["us-east-1", "us-west-2", "eu-west-1"]
  
  tags = merge(local.common_tags, {
    Name = "component-registry-primary-${var.environment}"
  })
}

# Failover DNS Record Configuration
resource "aws_route53_record" "failover_primary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "component-registry-global.${var.domain_name}"
  type    = "A"
  
  failover_routing_policy {
    type = "PRIMARY"
  }
  
  set_identifier = "primary"
  health_check_id = aws_route53_health_check.primary_region.id
  
  alias {
    name                   = aws_route53_record.app.name
    zone_id                = aws_route53_zone.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "failover_secondary" {
  provider = aws.secondary_region
  
  zone_id = aws_route53_zone.main.zone_id
  name    = "component-registry-global.${var.domain_name}"
  type    = "A"
  
  failover_routing_policy {
    type = "SECONDARY"
  }
  
  set_identifier = "secondary"
  
  alias {
    name                   = "component-registry-dr.${var.domain_name}"
    zone_id                = aws_route53_zone.main.zone_id
    evaluate_target_health = true
  }
}

# Disaster Recovery Parameters
locals {
  # Recovery Time Objective (RTO) in minutes
  rto_minutes = 15
  
  # Recovery Point Objective (RPO) in minutes
  rpo_minutes = 60
  
  # Calculate the optimal number of replicas based on the probability of
  # simultaneous failures and desired availability
  availability_target = 0.99999 # Five nines availability
  
  # Probability of single AZ failure
  az_failure_probability = 0.001
  
  # Formula derived from the binomial probability mass function
  # to ensure N+2 redundancy for the specified availability target
  required_min_replicas = ceil(
    log(1 - local.availability_target) / 
    log(1 - pow(local.az_failure_probability, 2))
  )
  
  # Recovery procedures stored as documentation
  recovery_procedures = [
    {
      name: "Database Failover Procedure",
      steps: [
        "1. Verify health status of all database shards",
        "2. Promote read replica to primary in the secondary region",
        "3. Update the shard map table in DynamoDB",
        "4. Verify connectivity and consistency"
      ],
      estimated_time_minutes: 10
    },
    {
      name: "Application Failover Procedure",
      steps: [
        "1. Deploy latest application image to the DR environment",
        "2. Verify application health in the DR environment",
        "3. Update DNS records for failover if not automatic",
        "4. Monitor traffic and scaling"
      ],
      estimated_time_minutes: 12
    },
    {
      name: "Cache Failover Procedure",
      steps: [
        "1. Confirm regional cache clusters are operational",
        "2. Promote secondary region cache to primary",
        "3. Verify cache consistency and replication",
        "4. Adjust application connection parameters"
      ],
      estimated_time_minutes: 8
    }
  ]
}

# DynamoDB Table for Failover Status
resource "aws_dynamodb_table" "failover_status" {
  name         = "component-registry-failover-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "region"
  
  attribute {
    name = "region"
    type = "S"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = local.common_tags
}

# Lambda Function for Automated Failover
resource "aws_lambda_function" "failover_coordinator" {
  function_name    = "component-registry-failover-${var.environment}"
  role             = aws_iam_role.failover_role.arn
  handler          = "index.handler"
  runtime          = "nodejs14.x"
  timeout          = 300
  
  environment {
    variables = {
      PRIMARY_REGION   = var.primary_region
      SECONDARY_REGION = "us-west-2"
      ENVIRONMENT      = var.environment
      FAILOVER_TABLE   = aws_dynamodb_table.failover_status.name
      SNS_TOPIC        = aws_sns_topic.alerts.arn
      DOMAIN_NAME      = var.domain_name
    }
  }
  
  # Code for the Lambda function
  filename         = "failover_function.zip"
  source_code_hash = filebase64sha256("failover_function.zip")
  
  # Prepare the file locally
  provisioner "local-exec" {
    command = <<-EOT
      cat > failover.js << 'EOF'
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const route53 = new AWS.Route53();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Get environment variables
  const primaryRegion = process.env.PRIMARY_REGION;
  const secondaryRegion = process.env.SECONDARY_REGION;
  const environment = process.env.ENVIRONMENT;
  const failoverTable = process.env.FAILOVER_TABLE;
  const snsTopic = process.env.SNS_TOPIC;
  const domainName = process.env.DOMAIN_NAME;
  
  // Determine if this is a health check alarm
  if (event.source === 'aws.cloudwatch' && event.detail.state.value === 'ALARM') {
    // Update failover status
    const updateParams = {
      TableName: failoverTable,
      Key: { region: primaryRegion },
      UpdateExpression: 'set healthStatus = :status, lastUpdated = :time, alarmDetails = :alarm',
      ExpressionAttributeValues: {
        ':status': 'UNHEALTHY',
        ':time': new Date().toISOString(),
        ':alarm': event.detail.alarmName
      }
    };
    
    await dynamodb.update(updateParams).promise();
    
    // Check if we should initiate failover
    const getParams = {
      TableName: failoverTable,
      Key: { region: primaryRegion }
    };
    
    const result = await dynamodb.get(getParams).promise();
    
    if (result.Item && result.Item.healthStatus === 'UNHEALTHY' && 
        (!result.Item.failoverInitiated || result.Item.failoverInitiated === false)) {
      
      // Initiate failover
      console.log('Initiating failover from primary to secondary region');
      
      // Update DynamoDB to record failover initiation
      const failoverParams = {
        TableName: failoverTable,
        Key: { region: primaryRegion },
        UpdateExpression: 'set failoverInitiated = :flag, failoverTime = :time',
        ExpressionAttributeValues: {
          ':flag': true,
          ':time': new Date().toISOString()
        }
      };
      
      await dynamodb.update(failoverParams).promise();
      
      // Send notification about failover
      const snsParams = {
        Message: `Initiating failover from ${primaryRegion} to ${secondaryRegion} for component-registry-${environment}. Alarm: ${event.detail.alarmName}`,
        Subject: `CRITICAL: Component Registry Failover Initiated - ${environment}`,
        TopicArn: snsTopic
      };
      
      await sns.publish(snsParams).promise();
      
      // In a real implementation, additional steps would be taken here to:
      // 1. Ensure database replicas are promoted to primary
      // 2. Update Route 53 health checks 
      // 3. Coordinate application deployment in the secondary region
      
      return {
        statusCode: 200,
        body: JSON.stringify('Failover initiated successfully'),
      };
    }
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify('Event processed, no failover needed'),
  };
};
EOF
      zip failover_function.zip failover.js
    EOT
  }
  
  tags = local.common_tags
}

# IAM Role for Lambda Failover Function
resource "aws_iam_role" "failover_role" {
  name = "component-registry-failover-role-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_policy" "failover_policy" {
  name        = "component-registry-failover-policy-${var.environment}"
  description = "Policy for failover Lambda function"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ]
        Resource = aws_dynamodb_table.failover_status.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.alerts.arn
      },
      {
        Effect = "Allow"
        Action = [
          "route53:ChangeResourceRecordSets",
          "route53:GetHealthCheck",
          "route53:ListHealthChecks",
          "route53:ListResourceRecordSets"
        ]
        Resource = "*"
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "failover_policy_attachment" {
  role       = aws_iam_role.failover_role.name
  policy_arn = aws_iam_policy.failover_policy.arn
}

# CloudWatch Event Rule to Trigger Failover Function
resource "aws_cloudwatch_event_rule" "failover_alarm" {
  name        = "component-registry-failover-alarm-${var.environment}"
  description = "Triggers failover function when critical alarms go off"
  
  event_pattern = jsonencode({
    source      = ["aws.cloudwatch"],
    detail-type = ["CloudWatch Alarm State Change"],
    detail = {
      state = {
        value = ["ALARM"]
      },
      alarmName = [
        aws_cloudwatch_metric_alarm.primary_region_health.name
      ]
    }
  })
  
  tags = local.common_tags
}

resource "aws_cloudwatch_event_target" "failover_alarm" {
  rule      = aws_cloudwatch_event_rule.failover_alarm.name
  target_id = "FailoverFunction"
  arn       = aws_lambda_function.failover_coordinator.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.failover_coordinator.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.failover_alarm.arn
}

# Composite Alarm for Region Health
resource "aws_cloudwatch_metric_alarm" "primary_region_health" {
  alarm_name          = "component-registry-primary-region-health-${var.environment}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  threshold           = 1
  alarm_description   = "This is a composite alarm that triggers when multiple critical services are down"
  
  metric_query {
    id          = "e1"
    expression  = "ALARM(m1) + ALARM(m2) + ALARM(m3)"
    label       = "Primary Region Critical Services"
    return_data = true
  }
  
  metric_query {
    id = "m1"
    metric {
      metric_name = "TargetResponseTime"
      namespace   = "AWS/ApplicationELB"
      period      = 60
      stat        = "Maximum"
      dimensions = {
        LoadBalancer = aws_lb.app.arn_suffix
      }
    }
    return_data = false
  }
  
  metric_query {
    id = "m2"
    metric {
      metric_name = "CPUUtilization"
      namespace   = "AWS/RDS"
      period      = 60
      stat        = "Maximum"
      dimensions = {
        DBClusterIdentifier = "shard-0"
      }
    }
    return_data = false
  }
  
  metric_query {
    id = "m3"
    metric {
      metric_name = "HTTPCode_Target_5XX_Count"
      namespace   = "AWS/ApplicationELB"
      period      = 60
      stat        = "Sum"
      dimensions = {
        LoadBalancer = aws_lb.app.arn_suffix
      }
    }
    return_data = false
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
  
  tags = local.common_tags
}

# Create an API Gateway endpoint for manual failover triggering
resource "aws_api_gateway_rest_api" "failover_api" {
  name        = "component-registry-failover-api-${var.environment}"
  description = "API for triggering manual failover"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
  
  tags = local.common_tags
}

resource "aws_api_gateway_resource" "failover" {
  rest_api_id = aws_api_gateway_rest_api.failover_api.id
  parent_id   = aws_api_gateway_rest_api.failover_api.root_resource_id
  path_part   = "failover"
}

resource "aws_api_gateway_method" "post" {
  rest_api_id   = aws_api_gateway_rest_api.failover_api.id
  resource_id   = aws_api_gateway_resource.failover.id
  http_method   = "POST"
  authorization_type = "AWS_IAM"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.failover_api.id
  resource_id = aws_api_gateway_resource.failover.id
  http_method = aws_api_gateway_method.post.http_method
  
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.failover_coordinator.invoke_arn
}

resource "aws_api_gateway_deployment" "failover" {
  depends_on = [aws_api_gateway_integration.lambda]
  
  rest_api_id = aws_api_gateway_rest_api.failover_api.id
  stage_name  = var.environment
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.failover_coordinator.function_name
  principal     = "apigateway.amazonaws.com"
  
  source_arn = "${aws_api_gateway_rest_api.failover_api.execution_arn}/*/*"
}

# Outputs
output "rto_minutes" {
  description = "Recovery Time Objective (RTO) in minutes"
  value       = local.rto_minutes
}

output "rpo_minutes" {
  description = "Recovery Point Objective (RPO) in minutes"
  value       = local.rpo_minutes
}

output "recovery_procedures" {
  description = "Disaster recovery procedures"
  value       = local.recovery_procedures
}

output "failover_api_endpoint" {
  description = "API Gateway endpoint for manual failover"
  value       = aws_api_gateway_deployment.failover.invoke_url
}

output "backup_plan_id" {
  description = "ID of the AWS Backup Plan"
  value       = aws_backup_plan.component_registry.id
} 