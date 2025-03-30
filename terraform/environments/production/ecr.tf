/**
 * UI Component Library - ECR Repository
 * 
 * This file defines the ECR repository for storing the component registry application Docker images.
 */

# ECR Repository
resource "aws_ecr_repository" "component_registry" {
  name                 = "ui-component-library/component-registry"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = aws_kms_key.encryption_key.arn
  }
  
  tags = local.common_tags
}

# ECR Repository Policy
resource "aws_ecr_repository_policy" "component_registry" {
  repository = aws_ecr_repository.component_registry.name
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPushPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            aws_iam_role.codebuild_role.arn,
            aws_iam_role.ecs_execution_role.arn
          ]
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
      }
    ]
  })
}

# ECR Lifecycle Policy
resource "aws_ecr_lifecycle_policy" "component_registry" {
  repository = aws_ecr_repository.component_registry.name
  
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 production images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["prod"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep last 20 any images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 20
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Outputs
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.component_registry.repository_url
} 