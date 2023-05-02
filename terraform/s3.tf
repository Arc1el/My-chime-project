# make artifact s3 bucket
module "s3_bucket_for_artifact" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "terraform-chime-atififact-s3"
  acl    = "private"

  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  versioning = {
    enabled = false
  }
}

# make record s3 bucket
module "s3_bucket_for_record" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "terraform-chime-record-s3"
  acl    = "private"

  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  versioning = {
    enabled = false
  }
}

# make concat s3 bucket
module "s3_bucket_for_concat" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "terraform-chime-concat-s3"
  acl    = "private"

  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  versioning = {
    enabled = false
  }
}

################################################################
# bucket policy for [s3_bucket_for_record]                     #
################################################################
resource "aws_s3_bucket_policy" "s3_record" {
  bucket = module.s3_bucket_for_record.s3_bucket_id
  policy = data.aws_iam_policy_document.s3_record.json
}
data "aws_iam_policy_document" "s3_record" {
  statement {
    sid    = "AWSChimeMediaCaptureBucketPolicy"
    effect = "Allow"

    resources = [
      "${module.s3_bucket_for_record.s3_bucket_arn}/*",
      module.s3_bucket_for_record.s3_bucket_arn,
    ]

    actions = [
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:GetObject",
      "s3:ListBucket",
    ]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = ["759320821027"]
    }

    condition {
      test     = "ArnLike"
      variable = "aws:SourceArn"
      values   = ["arn:aws:chime:*:759320821027:*"]
    }

    principals {
      type        = "Service"
      identifiers = ["mediapipelines.chime.amazonaws.com"]
    }
  }
}

################################################################
# bucket policy for [s3_bucket_for_concat]                     #
################################################################
resource "aws_s3_bucket_policy" "s3_concat" {
  bucket = module.s3_bucket_for_concat.s3_bucket_id
  policy = data.aws_iam_policy_document.s3_concat.json
}
data "aws_iam_policy_document" "s3_concat" {
  statement {
    sid       = "AWSChimeMediaConcatenationBucketPolicy"
    effect    = "Allow"
    
    resources = [
      "${module.s3_bucket_for_concat.s3_bucket_arn}/*",
      module.s3_bucket_for_concat.s3_bucket_arn,
    ]

    actions = [
      "s3:PutObject",
      "s3:PutObjectAcl",
    ]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = ["759320821027"]
    }

    condition {
      test     = "ArnLike"
      variable = "aws:SourceArn"
      values   = ["arn:aws:chime:*:759320821027:*"]
    }

    principals {
      type        = "Service"
      identifiers = ["mediapipelines.chime.amazonaws.com"]
    }
  }
}