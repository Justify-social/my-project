# UI Component Library - Production Environment

This directory contains the Terraform configuration for deploying the UI Component Library's Component Registry to a production environment in AWS.

## Architecture Overview

The production environment is designed with the following key features:

- **Multi-region deployment**: Primary region with replica regions for global availability
- **Database sharding**: Horizontal scaling through mathematically optimized shard distribution
- **Multi-region caching**: Global Redis cache with latency-based routing
- **Blue/Green deployments**: Zero-downtime deployments with automatic rollback
- **Container-based microservices**: Scalable ECS Fargate deployment
- **CI/CD Pipeline**: Fully automated build, test, and deployment process

![Architecture Diagram](./architecture-diagram.png)

## Infrastructure Components

The infrastructure is composed of the following components:

1. **VPC and Networking**:

   - Multi-AZ deployment across 3 availability zones
   - Public, private, database, and cache subnets
   - NAT gateways for outbound connectivity

2. **Database Layer**:

   - Sharded Aurora PostgreSQL clusters
   - DynamoDB shard mapping table
   - Read replicas for scaling read operations

3. **Caching Layer**:

   - Multi-region ElastiCache Redis clusters
   - Latency-based routing with Route 53
   - Optimized for CAP theorem trade-offs

4. **Application Layer**:

   - ECS Fargate for containerized applications
   - Auto-scaling based on CPU and memory metrics
   - Health monitoring and automatic recovery

5. **CI/CD Pipeline**:

   - CodeCommit, CodeBuild, CodeDeploy, and CodePipeline
   - Blue/Green deployment strategy
   - Automated testing and quality gates

6. **Security**:
   - KMS encryption for data at rest
   - IAM roles with least privilege
   - Security groups for network isolation

## Deployment Instructions

### Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform v1.0.0 or higher
- S3 bucket for Terraform state (defined in main.tf)
- DynamoDB table for state locking (defined in main.tf)

### Sensitive Variables

The following sensitive variables need to be provided:

```
db_username       = "admin"
db_password       = "your-secure-password"
app_version       = "1.0.0"
ecr_repository_url = "..." # Will be output after initial deployment
```

Store these in a `terraform.tfvars` file (do not commit to version control) or provide them via environment variables.

### Deployment Steps

1. **Initialize Terraform**:

   ```bash
   terraform init
   ```

2. **Plan the deployment**:

   ```bash
   terraform plan -out=tfplan
   ```

3. **Apply the configuration**:

   ```bash
   terraform apply tfplan
   ```

4. **Verify the deployment**:

   After deployment completes, verify that all components are operational:

   ```bash
   aws ecs describe-services --cluster component-registry-production --services component-registry-production
   ```

### Post-Deployment Setup

After the initial deployment, you'll need to:

1. Configure the CodeCommit repository with your application code
2. Set up the first production build manually or push to the main branch
3. Update DNS records if needed to point to the application URL

## CI/CD Pipeline Usage

The CI/CD pipeline is triggered automatically when changes are pushed to the `main` branch of the CodeCommit repository. It performs the following steps:

1. Pulls the source code from CodeCommit
2. Builds and tests the application
3. Creates a Docker image and pushes it to ECR
4. Deploys the application using Blue/Green deployment

## Monitoring and Operations

The following resources are available for monitoring:

- CloudWatch Logs: `/ecs/component-registry-production`
- CloudWatch Alarms: Set up for critical metrics
- SNS Topics: Notifications for pipeline status and alarms

## Scaling Considerations

The infrastructure can be scaled in the following ways:

- **Database**: Increase `db_shard_count` for more database shards
- **Cache**: Increase `cache_total_nodes` for more cache nodes
- **Application**: Adjust `app_min_count` and `app_max_count` for application scaling

## Disaster Recovery

The infrastructure includes the following DR features:

- Multi-region deployment for geographical redundancy
- Automated backups with 14-day retention for databases
- Blue/Green deployment with automatic rollback
- Point-in-time recovery for DynamoDB tables

## Maintenance

Regular maintenance tasks include:

- Review CloudWatch logs and metrics
- Monitor ECR image scanning results
- Apply security patches to the application
- Rotate database credentials periodically

## Security Considerations

The infrastructure implements the following security best practices:

- Encryption for data at rest and in transit
- IAM roles with least privilege
- Network isolation with security groups
- Secrets management for sensitive configuration

## Troubleshooting

Common issues and their solutions:

- **Deployment failures**: Check CodePipeline execution details
- **Application health issues**: Review ECS service events and logs
- **Database connectivity**: Verify security group rules and credentials
- **Cache performance**: Monitor ElastiCache metrics
