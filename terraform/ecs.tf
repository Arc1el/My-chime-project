module "ecs" {
  source = "terraform-aws-modules/ecs/aws"

  cluster_name = "terraform-mychime-cluster"

  cluster_configuration = {
    execute_command_configuration = {
      logging = "OVERRIDE"
      log_configuration = {
        cloud_watch_log_group_name = "/aws/ecs/aws-ec2"
      }
    }
  }

  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
  }

  services = {
    terraform-mychime-backend = {
      cpu    = 1024
      memory = 4096

      # Container definition(s)
      container_definitions = {

        container = {
          cpu       = 512
          memory    = 1024
          essential = true
          image     = "${module.ecr_backend.repository_arn}:latest"
          memory_reservation = 50

          port_mappings = [
            {
              name          = "backend_port_mappings"
              containerPort = 3001
              protocol      = "tcp"
            }
          ]
        }
      }

      service_connect_configuration = {
        namespace = "example"
        service = {
          client_alias = {
            port     = 3001
            dns_name = "ecs-sample"
          }
          port_name      = "ecs-sample"
          discovery_name = "ecs-sample"
        }
      }

      load_balancer = {
        service = {
          target_group_arn = module.alb_backend.target_group_arns
          container_name   = "ecs-sample"
          container_port   = 3001
        }
      }

      subnet_ids = module.vpc.public_subnets
      security_group_rules = {
        alb_ingress_3001 = {
          type                     = "ingress"
          from_port                = 3001
          to_port                  = 3001
          protocol                 = "tcp"
          description              = "Service port"
          source_security_group_id = module.ecs_sg_backend.security_group_id
        }
        egress_all = {
          type        = "egress"
          from_port   = 0
          to_port     = 0
          protocol    = "-1"
          cidr_blocks = ["0.0.0.0/0"]
        }
      }
    }
  }

  tags = {
    Environment = "Development"
    Project     = "Example"
  }
}

module "ecs_sg_backend" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "terraform-ecs_sg_backend"
  description = "Security group for user-service with custom ports open within VPC, and PostgreSQL publicly open"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 3001
      to_port     = 3001
      protocol    = "tcp"
      description = "User-service ports"
      cidr_blocks = "0.0.0.0/0"
    },
  ]
}