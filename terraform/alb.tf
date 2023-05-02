module "alb_backend" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 8.0"

  name = "terrform-alb-backend"

  load_balancer_type = "application"

  vpc_id             = module.vpc.vpc_id
  subnets            = module.vpc.public_subnets
  security_groups    = [module.alb_sg_backend.security_group_id]

  target_groups = [
    {
      name_prefix      = "tf-"
      backend_protocol = "HTTP"
      backend_port     = 3001
      target_type      = "instance"
      targets = {
      }
    }
  ]

  http_tcp_listeners = [
    {
      port               = 3001
      protocol           = "HTTP"
      target_group_index = 0
    }
  ]

  tags = {
    Environment = "Test"
  }
}

module "alb_sg_backend" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "terraform-alb-sg-back"
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