module "ecr_backend" {
  source = "terraform-aws-modules/ecr/aws"

  repository_name = "terraform-chime-backend"

  tags = {
    Terraform   = "true"
    Environment = "dev"
  }
}