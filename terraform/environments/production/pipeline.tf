/**
 * UI Component Library - CI/CD Pipeline
 * 
 * This file defines the CI/CD pipeline for the component registry application.
 */

# S3 bucket for CodePipeline artifacts
resource "aws_s3_bucket" "codepipeline_bucket" {
  bucket        = "ui-component-library-pipeline-${var.environment}"
  force_destroy = true  # Allow deletion of the bucket even when it contains objects
  
  tags = local.common_tags
}

resource "aws_s3_bucket_ownership_controls" "codepipeline_bucket" {
  bucket = aws_s3_bucket.codepipeline_bucket.id
  
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "codepipeline_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.codepipeline_bucket]
  
  bucket = aws_s3_bucket.codepipeline_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_versioning" "codepipeline_bucket" {
  bucket = aws_s3_bucket.codepipeline_bucket.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "codepipeline_bucket" {
  bucket = aws_s3_bucket.codepipeline_bucket.id
  
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.encryption_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# IAM role for CodePipeline
resource "aws_iam_role" "codepipeline_role" {
  name = "component-registry-pipeline-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codepipeline.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

# IAM policy for CodePipeline
resource "aws_iam_policy" "codepipeline_policy" {
  name        = "component-registry-pipeline-policy-${var.environment}"
  description = "Policy for CodePipeline execution"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.codepipeline_bucket.arn,
          "${aws_s3_bucket.codepipeline_bucket.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "codecommit:GetBranch",
          "codecommit:GetCommit",
          "codecommit:GetRepository",
          "codecommit:GetUploadArchiveStatus",
          "codecommit:UploadArchive"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "codedeploy:CreateDeployment",
          "codedeploy:GetApplication",
          "codedeploy:GetApplicationRevision",
          "codedeploy:GetDeployment",
          "codedeploy:GetDeploymentConfig",
          "codedeploy:RegisterApplicationRevision"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:DescribeImages"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition",
          "ecs:DescribeServices",
          "ecs:UpdateService"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = "*"
        Condition = {
          StringEqualsIfExists = {
            "iam:PassedToService" = [
              "ecs-tasks.amazonaws.com",
              "codedeploy.amazonaws.com"
            ]
          }
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "codepipeline_policy_attachment" {
  role       = aws_iam_role.codepipeline_role.name
  policy_arn = aws_iam_policy.codepipeline_policy.arn
}

# IAM role for CodeBuild
resource "aws_iam_role" "codebuild_role" {
  name = "component-registry-codebuild-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

# IAM policy for CodeBuild
resource "aws_iam_policy" "codebuild_policy" {
  name        = "component-registry-codebuild-policy-${var.environment}"
  description = "Policy for CodeBuild execution"
  
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
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.codepipeline_bucket.arn,
          "${aws_s3_bucket.codepipeline_bucket.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = "*"
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

resource "aws_iam_role_policy_attachment" "codebuild_policy_attachment" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = aws_iam_policy.codebuild_policy.arn
}

# IAM role for CodeDeploy
resource "aws_iam_role" "codedeploy_role" {
  name = "component-registry-codedeploy-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codedeploy.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "codedeploy_policy_attachment" {
  role       = aws_iam_role.codedeploy_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS"
}

# CloudWatch Log Group for CodeBuild
resource "aws_cloudwatch_log_group" "codebuild_logs" {
  name              = "/aws/codebuild/component-registry-${var.environment}"
  retention_in_days = 14
  
  tags = local.common_tags
}

# CodeBuild Project
resource "aws_codebuild_project" "component_registry" {
  name          = "component-registry-${var.environment}"
  description   = "Build project for the Component Registry application"
  build_timeout = "30"
  service_role  = aws_iam_role.codebuild_role.arn
  
  artifacts {
    type = "CODEPIPELINE"
  }
  
  environment {
    compute_type                = "BUILD_GENERAL1_MEDIUM"
    image                       = "aws/codebuild/amazonlinux2-x86_64-standard:3.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true
    
    environment_variable {
      name  = "REPOSITORY_URI"
      value = var.ecr_repository_url
    }
    
    environment_variable {
      name  = "ENVIRONMENT"
      value = var.environment
    }
    
    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.primary_region
    }
  }
  
  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec.yml"
  }
  
  logs_config {
    cloudwatch_logs {
      group_name = aws_cloudwatch_log_group.codebuild_logs.name
    }
  }
  
  tags = local.common_tags
}

# CodeDeploy Application
resource "aws_codedeploy_app" "component_registry" {
  name             = "component-registry-${var.environment}"
  compute_platform = "ECS"
  
  tags = local.common_tags
}

# CodeDeploy Deployment Group
resource "aws_codedeploy_deployment_group" "component_registry" {
  app_name               = aws_codedeploy_app.component_registry.name
  deployment_group_name  = "component-registry-${var.environment}"
  service_role_arn       = aws_iam_role.codedeploy_role.arn
  deployment_config_name = "CodeDeployDefault.ECSAllAtOnce"
  
  ecs_service {
    cluster_name = aws_ecs_cluster.app_cluster.name
    service_name = aws_ecs_service.app.name
  }
  
  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }
  
  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }
    
    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 5
    }
  }
  
  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }
  
  load_balancer_info {
    target_group_pair_info {
      prod_traffic_route {
        listener_arns = [aws_lb_listener.https.arn]
      }
      
      target_group {
        name = aws_lb_target_group.app.name
      }
      
      target_group {
        name = aws_lb_target_group.app_green.name
      }
    }
  }
  
  tags = local.common_tags
}

# Green Target Group for Blue/Green Deployment
resource "aws_lb_target_group" "app_green" {
  name        = "component-registry-tg-green-${var.environment}"
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
  
  tags = merge(local.common_tags, {
    Name = "component-registry-tg-green-${var.environment}"
  })
}

# CodePipeline
resource "aws_codepipeline" "component_registry" {
  name     = "component-registry-${var.environment}"
  role_arn = aws_iam_role.codepipeline_role.arn
  
  artifact_store {
    location = aws_s3_bucket.codepipeline_bucket.bucket
    type     = "S3"
    
    encryption_key {
      id   = aws_kms_key.encryption_key.arn
      type = "KMS"
    }
  }
  
  stage {
    name = "Source"
    
    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeCommit"
      version          = "1"
      output_artifacts = ["source_output"]
      
      configuration = {
        RepositoryName       = "ui-component-library"
        BranchName           = "main"
        PollForSourceChanges = "false"
      }
    }
  }
  
  stage {
    name = "Build"
    
    action {
      name             = "BuildAndPushImage"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      
      configuration = {
        ProjectName = aws_codebuild_project.component_registry.name
      }
    }
  }
  
  stage {
    name = "Deploy"
    
    action {
      name            = "DeployToECS"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "CodeDeployToECS"
      version         = "1"
      input_artifacts = ["build_output"]
      
      configuration = {
        ApplicationName                = aws_codedeploy_app.component_registry.name
        DeploymentGroupName            = aws_codedeploy_deployment_group.component_registry.deployment_group_name
        TaskDefinitionTemplateArtifact = "build_output"
        TaskDefinitionTemplatePath     = "taskdef.json"
        AppSpecTemplateArtifact        = "build_output"
        AppSpecTemplatePath            = "appspec.yml"
      }
    }
  }
  
  tags = local.common_tags
}

# CloudWatch Events Rule to detect code changes and trigger pipeline
resource "aws_cloudwatch_event_rule" "component_registry_pipeline_trigger" {
  name        = "component-registry-pipeline-trigger-${var.environment}"
  description = "Triggers the CodePipeline when changes are pushed to the repository"
  
  event_pattern = jsonencode({
    source      = ["aws.codecommit"]
    detail-type = ["CodeCommit Repository State Change"]
    resources   = ["arn:aws:codecommit:${var.primary_region}:${data.aws_caller_identity.current.account_id}:ui-component-library"]
    detail = {
      event         = ["referenceCreated", "referenceUpdated"]
      referenceType = ["branch"]
      referenceName = ["main"]
    }
  })
  
  tags = local.common_tags
}

# Get current AWS account ID for ARN construction
data "aws_caller_identity" "current" {}

# CloudWatch Events Target to trigger pipeline
resource "aws_cloudwatch_event_target" "component_registry_pipeline_trigger" {
  rule     = aws_cloudwatch_event_rule.component_registry_pipeline_trigger.name
  arn      = aws_codepipeline.component_registry.arn
  role_arn = aws_iam_role.cloudwatch_events_role.arn
}

# IAM Role for CloudWatch Events
resource "aws_iam_role" "cloudwatch_events_role" {
  name = "component-registry-cloudwatch-events-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

# IAM Policy for CloudWatch Events
resource "aws_iam_policy" "cloudwatch_events_policy" {
  name        = "component-registry-cloudwatch-events-policy-${var.environment}"
  description = "Policy for CloudWatch Events to trigger CodePipeline"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "codepipeline:StartPipelineExecution"
        ]
        Resource = [
          aws_codepipeline.component_registry.arn
        ]
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "cloudwatch_events_policy_attachment" {
  role       = aws_iam_role.cloudwatch_events_role.name
  policy_arn = aws_iam_policy.cloudwatch_events_policy.arn
}

# SNS Topic for pipeline notifications
resource "aws_sns_topic" "pipeline_notifications" {
  name = "component-registry-pipeline-notifications-${var.environment}"
  
  tags = local.common_tags
}

# CloudWatch Event Rule for pipeline state changes
resource "aws_cloudwatch_event_rule" "pipeline_state_change" {
  name        = "component-registry-pipeline-state-change-${var.environment}"
  description = "Tracks pipeline state changes"
  
  event_pattern = jsonencode({
    source      = ["aws.codepipeline"]
    detail-type = ["CodePipeline Pipeline Execution State Change"]
    detail = {
      pipeline = [aws_codepipeline.component_registry.name]
      state    = ["FAILED", "SUCCEEDED"]
    }
  })
  
  tags = local.common_tags
}

# CloudWatch Event Target for pipeline notifications
resource "aws_cloudwatch_event_target" "pipeline_notifications" {
  rule      = aws_cloudwatch_event_rule.pipeline_state_change.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.pipeline_notifications.arn
  
  input_transformer {
    input_paths = {
      pipeline = "$.detail.pipeline"
      state    = "$.detail.state"
      time     = "$.time"
    }
    
    input_template = "\"The pipeline <pipeline> has <state> at <time>.\""
  }
}

# Outputs
output "pipeline_url" {
  description = "URL to the CodePipeline in the AWS Console"
  value       = "https://console.aws.amazon.com/codesuite/codepipeline/pipelines/${aws_codepipeline.component_registry.name}/view?region=${var.primary_region}"
}

output "pipeline_notification_topic_arn" {
  description = "ARN of the SNS topic for pipeline notifications"
  value       = aws_sns_topic.pipeline_notifications.arn
} 