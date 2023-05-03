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
    terraform-chime-backend = {
      cpu    = 1024
      memory = 4096

      container_definitions = {
        chime-backend = {
          cpu       = 512
          memory    = 1024
          essential = true
          image     = "759320821027.dkr.ecr.ap-northeast-2.amazonaws.com/hmkim-project-backend:latest"
          memory_reservation = 50
          port_mappings = [
            {
              name          = "port3001"
              containerPort = 3001
              protocol      = "tcp"
            }
          ]
        }
      }

      load_balancer = {
        service = {
          target_group_arn = module.alb_backend.target_group_arns[0]
          container_name   = "chime-backend"
          container_port   = 3001
        } 
      }

      subnet_ids = module.vpc.public_subnets
      security_group_rules = {
        alb_ingress_3000 = {
          type                     = "ingress"
          from_port                = 3001
          to_port                  = 3001
          protocol                 = "tcp"
          description              = "Service port"
          cidr_blocks = ["0.0.0.0/0"]
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