# Haveloc Pro — Terraform Infrastructure
# AWS EKS + RDS + ElastiCache + S3

terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }

  backend "s3" {
    bucket         = "haveloc-pro-terraform"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}

# ── Provider ──
provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project     = "haveloc-pro"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ── Variables ──
variable "region" {
  default = "us-east-1"
}

variable "environment" {
  default = "production"
}

variable "db_password" {
  sensitive = true
}

# ── VPC ──
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "haveloc-pro-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b", "${var.region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}

# ── EKS Cluster ──
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "haveloc-pro"
  cluster_version = "1.31"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    main = {
      instance_types = ["t3.large"]
      min_size       = 2
      max_size       = 10
      desired_size   = 3
    }
    ai = {
      instance_types = ["g4dn.xlarge"]
      min_size       = 0
      max_size       = 3
      desired_size   = 1
      labels = {
        workload = "ai"
      }
      taints = [{
        key    = "workload"
        value  = "ai"
        effect = "NO_SCHEDULE"
      }]
    }
  }
}

# ── RDS PostgreSQL ──
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "haveloc-pro-db"

  engine               = "postgres"
  engine_version       = "16.4"
  family               = "postgres16"
  major_engine_version = "16"
  instance_class       = "db.r6g.large"

  allocated_storage     = 100
  max_allocated_storage = 500
  storage_encrypted     = true

  db_name  = "haveloc_pro"
  username = "haveloc"
  password = var.db_password
  port     = 5432

  multi_az = true

  vpc_security_group_ids = [module.vpc.default_security_group_id]
  create_db_subnet_group = true
  subnet_ids             = module.vpc.private_subnets

  backup_retention_period = 30
  deletion_protection     = true

  performance_insights_enabled = true
}

# ── ElastiCache Redis ──
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "haveloc-pro-cache"
  description          = "Haveloc Pro Redis Cluster"

  engine               = "redis"
  engine_version       = "7.1"
  node_type            = "cache.r6g.large"
  num_cache_clusters   = 2
  port                 = 6379

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  automatic_failover_enabled = true

  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [module.vpc.default_security_group_id]
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "haveloc-pro-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

# ── S3 Buckets ──
resource "aws_s3_bucket" "uploads" {
  bucket = "haveloc-pro-uploads-${var.environment}"
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

# ── Outputs ──
output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "s3_bucket" {
  value = aws_s3_bucket.uploads.bucket
}
