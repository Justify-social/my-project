/**
 * UI Component Library - Monitoring and Observability
 * 
 * This file defines the monitoring and observability infrastructure for the
 * component registry application, implementing mathematically sound alerting
 * thresholds and anomaly detection.
 */

# CloudWatch Dashboard for Component Registry
resource "aws_cloudwatch_dashboard" "component_registry" {
  dashboard_name = "component-registry-${var.environment}"
  
  dashboard_body = jsonencode({
    widgets = [
      # Header with key metrics
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# UI Component Library - Production Dashboard\nKey metrics and performance indicators for the component registry system."
        }
      },
      
      # Application metrics
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "component-registry-${var.environment}", "ClusterName", "component-registry-${var.environment}", { "stat": "Average" }],
            [".", "MemoryUtilization", ".", ".", ".", ".", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.primary_region
          title   = "ECS CPU and Memory Utilization"
          period  = 60
        }
      },
      
      # Request metrics
      {
        type   = "metric"
        x      = 8
        y      = 1
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "${aws_lb.app.arn_suffix}", { "stat": "Sum", "period": 60 }],
            [".", "TargetResponseTime", ".", ".", { "stat": "Average", "period": 60 }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.primary_region
          title   = "Request Volume and Latency"
        }
      },
      
      # Error metrics
      {
        type   = "metric"
        x      = 16
        y      = 1
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", "${aws_lb.app.arn_suffix}", { "stat": "Sum" }],
            [".", "HTTPCode_Target_4XX_Count", ".", ".", { "stat": "Sum" }],
            [".", "RejectedConnectionCount", ".", ".", { "stat": "Sum" }]
          ]
          view    = "timeSeries"
          stacked = true
          region  = var.primary_region
          title   = "Error Counts"
        }
      },
      
      # Database metrics
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBClusterIdentifier", "shard-0", { "stat": "Average" }],
            ["...", "shard-1", { "stat": "Average" }],
            ["...", "shard-2", { "stat": "Average" }],
            ["...", "shard-3", { "stat": "Average" }],
            ["...", "shard-4", { "stat": "Average" }],
            ["...", "shard-5", { "stat": "Average" }],
            ["...", "shard-6", { "stat": "Average" }],
            ["...", "shard-7", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.primary_region
          title   = "Database Shard CPU Utilization"
        }
      },
      
      # Cache metrics
      {
        type   = "metric"
        x      = 12
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", "component-registry-cache-${var.environment}", { "stat": "Average" }],
            [".", "CurrConnections", ".", ".", { "stat": "Average", "yAxis": "right" }],
            [".", "CacheHits", ".", ".", { "stat": "Sum" }],
            [".", "CacheMisses", ".", ".", { "stat": "Sum" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.primary_region
          title   = "Cache Performance Metrics"
        }
      },
      
      # Replication lag metrics
      {
        type   = "metric"
        x      = 0
        y      = 13
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ElastiCache", "ReplicationLag", "CacheClusterId", "component-registry-cache-${var.environment}-us-west-2", { "stat": "Average" }],
            ["...", "component-registry-cache-${var.environment}-eu-west-1", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.primary_region
          title   = "Cache Replication Lag"
          annotations = {
            horizontal = [
              {
                value = local.replication_lag_tolerance_ms / 1000
                label = "Tolerance Threshold"
                color = "#ff9900"
              }
            ]
          }
        }
      },
      
      # Consistency probability visualization
      {
        type   = "metric"
        x      = 12
        y      = 13
        width  = 12
        height = 6
        properties = {
          metrics = [
            [{ "expression": "${module.component_registry_cache.consistency_probability * 100}", "label": "Consistency Probability (%)", "id": "e1" }]
          ]
          view    = "gauge"
          region  = var.primary_region
          title   = "Cache Consistency Probability"
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
      }
    ]
  })
}

# Set up CloudWatch Alarms with dynamic thresholds
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_alarm" {
  alarm_name          = "component-registry-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors ECS CPU utilization"
  
  dimensions = {
    ClusterName = aws_ecs_cluster.app_cluster.name
    ServiceName = aws_ecs_service.app.name
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_alarm" {
  alarm_name          = "component-registry-memory-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors ECS memory utilization"
  
  dimensions = {
    ClusterName = aws_ecs_cluster.app_cluster.name
    ServiceName = aws_ecs_service.app.name
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "database_connection_alarm" {
  count = var.db_shard_count
  
  alarm_name          = "shard-${count.index}-connections-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = var.max_connections_per_instance * 0.8 # 80% of max connections
  alarm_description   = "This alarm monitors database connection count for shard ${count.index}"
  
  dimensions = {
    DBClusterIdentifier = "shard-${count.index}"
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "api_latency_alarm" {
  alarm_name          = "component-registry-latency-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "p95"
  threshold           = 0.5 # 500ms
  alarm_description   = "This alarm monitors API response time (p95)"
  
  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "error_rate_alarm" {
  alarm_name          = "component-registry-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10 # More than 10 errors in a minute
  alarm_description   = "This alarm monitors API error rate"
  
  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

# Anomaly Detection Alarms
resource "aws_cloudwatch_metric_alarm" "cpu_anomaly_detection" {
  alarm_name          = "component-registry-cpu-anomaly-${var.environment}"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 5
  threshold_metric_id = "e1"
  alarm_description   = "This alarm detects anomalies in CPU utilization using machine learning"
  
  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 3)"
    label       = "CPUUtilization (Expected)"
    return_data = true
  }
  
  metric_query {
    id          = "m1"
    metric {
      metric_name = "CPUUtilization"
      namespace   = "AWS/ECS"
      period      = 60
      stat        = "Average"
      dimensions = {
        ClusterName = aws_ecs_cluster.app_cluster.name
        ServiceName = aws_ecs_service.app.name
      }
    }
    return_data = true
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "request_anomaly_detection" {
  alarm_name          = "component-registry-request-anomaly-${var.environment}"
  comparison_operator = "LessThanLowerThreshold"
  evaluation_periods  = 5
  threshold_metric_id = "e1"
  alarm_description   = "This alarm detects anomalies in request count using machine learning"
  
  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 3)"
    label       = "RequestCount (Expected)"
    return_data = true
  }
  
  metric_query {
    id          = "m1"
    metric {
      metric_name = "RequestCount"
      namespace   = "AWS/ApplicationELB"
      period      = 60
      stat        = "Sum"
      dimensions = {
        LoadBalancer = aws_lb.app.arn_suffix
      }
    }
    return_data = true
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

# Synthetic Canary for endpoint monitoring
resource "aws_synthetics_canary" "api_monitor" {
  name                 = "component-registry-api-${var.environment}"
  artifact_s3_location = "s3://${aws_s3_bucket.monitoring_artifacts.bucket}/canary-results/"
  execution_role_arn   = aws_iam_role.canary_role.arn
  handler              = "index.handler"
  zip_file             = "canary-files/api-monitor.zip"
  runtime_version      = "syn-nodejs-puppeteer-3.7"
  
  schedule {
    expression = "rate(5 minutes)"
  }
  
  # Create the canary script
  provisioner "local-exec" {
    command = <<-EOT
      mkdir -p canary-files
      cat > canary-files/api-monitor.js << 'EOF'
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const apiCanary = async function () {
  // Get the health endpoint
  const healthURL = 'https://component-registry.${var.domain_name}/health';
  const response = await synthetics.executeHttpStep('Check Health Endpoint', healthURL);
  
  // Validate response
  if (response.statusCode !== 200) {
    throw new Error(`Health check failed with status code: ${response.statusCode}`);
  }
  
  // Check response time
  const responseTime = response.responseTime;
  log.info(`Health check response time: ${responseTime}ms`);
  
  // Alert if response time exceeds threshold
  if (responseTime > 500) {
    log.warn(`Health check response time (${responseTime}ms) exceeds threshold (500ms)`);
  }
  
  // Validate response body
  try {
    const body = JSON.parse(response.body);
    if (body.status !== 'ok') {
      throw new Error(`Health check returned unexpected status: ${body.status}`);
    }
  } catch (error) {
    throw new Error(`Failed to parse health check response: ${error.message}`);
  }
  
  // All validations passed
  log.info('Health check passed');
};

exports.handler = async () => {
  return await synthetics.executeStep('Component Registry API Health Check', apiCanary);
};
EOF
      cd canary-files && zip -r api-monitor.zip api-monitor.js
    EOT
  }
  
  tags = local.common_tags
}

# S3 bucket for monitoring artifacts
resource "aws_s3_bucket" "monitoring_artifacts" {
  bucket        = "component-registry-monitoring-${var.environment}-${data.aws_caller_identity.current.account_id}"
  force_destroy = true  # Allow deletion of the bucket even when it contains objects
  
  tags = local.common_tags
}

resource "aws_s3_bucket_ownership_controls" "monitoring_artifacts" {
  bucket = aws_s3_bucket.monitoring_artifacts.id
  
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "monitoring_artifacts" {
  depends_on = [aws_s3_bucket_ownership_controls.monitoring_artifacts]
  
  bucket = aws_s3_bucket.monitoring_artifacts.id
  acl    = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "monitoring_artifacts" {
  bucket = aws_s3_bucket.monitoring_artifacts.id
  
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.encryption_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# IAM role for synthetic canaries
resource "aws_iam_role" "canary_role" {
  name = "component-registry-canary-${var.environment}"
  
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

resource "aws_iam_policy" "canary_policy" {
  name        = "component-registry-canary-policy-${var.environment}"
  description = "Policy for synthetic canaries"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = [
          "${aws_s3_bucket.monitoring_artifacts.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = ["*"]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = ["*"]
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "CloudWatchSynthetics"
          }
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "canary_policy_attachment" {
  role       = aws_iam_role.canary_role.name
  policy_arn = aws_iam_policy.canary_policy.arn
}

# Distributed tracing with X-Ray
resource "aws_xray_sampling_rule" "component_registry" {
  rule_name      = "component-registry-${var.environment}"
  priority       = 1000
  reservoir_size = 100
  fixed_rate     = 0.05
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_name   = "component-registry"
  service_type   = "*"
  
  tags = local.common_tags
}

# AWS Evidently for progressive feature deployment
resource "aws_evidently_project" "component_registry" {
  name        = "component-registry-${var.environment}"
  description = "Feature flags and experiments for component registry"
  
  tags = local.common_tags
}

resource "aws_evidently_feature" "cache_strategy" {
  name = "cache-strategy"
  project = aws_evidently_project.component_registry.name
  
  variations {
    name = "control"
    value = jsonencode({
      "strategy": "ttl-based",
      "ttl": 300,
      "preload": false
    })
  }
  
  variations {
    name = "treatment"
    value = jsonencode({
      "strategy": "predictive",
      "ttl": 300,
      "preload": true,
      "heatmap": true
    })
  }
  
  default_variation = "control"
  
  tags = local.common_tags
}

# Prometheus metrics scraping for Istio (if enabled)
resource "aws_prometheus_workspace" "component_registry" {
  alias = "component-registry-${var.environment}"
  
  tags = local.common_tags
}

# ServiceLens dependency mapping
resource "aws_cloudwatch_log_group" "xray_logs" {
  name              = "/aws/xray/component-registry-${var.environment}"
  retention_in_days = 14
  
  tags = local.common_tags
}

# Outputs
output "dashboard_url" {
  description = "URL to the CloudWatch Dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.primary_region}#dashboards:name=${aws_cloudwatch_dashboard.component_registry.dashboard_name}"
}

output "monitoring_bucket" {
  description = "S3 bucket for monitoring artifacts"
  value       = aws_s3_bucket.monitoring_artifacts.bucket
}

output "synthetics_canary_url" {
  description = "URL to the Synthetics Canary"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.primary_region}#synthetics:canary/detail/${aws_synthetics_canary.api_monitor.name}"
}

output "xray_service_map_url" {
  description = "URL to the X-Ray Service Map"
  value       = "https://console.aws.amazon.com/xray/home?region=${var.primary_region}#/service-map"
}

locals {
  replication_lag_tolerance_ms = min(
    var.max_acceptable_lag_ms,
    var.data_volatility_factor * var.avg_transaction_time_ms
  )
} 