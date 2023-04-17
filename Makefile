# 이미지 세부 정의
# Define the image

IMAGE_NAME=mychimeproject
IAMGE_VERSION=latest
ENV_FILE=container.env
CONATINER_NAME=mychimeproject
IMAGE_LABEL=$(IMAGE_NAME):$(IAMGE_VERSION)

# 리전, 리포 정의 (ECR 주소를 사용하여 추출)
# Define Region, Repo name
REGION = $(word 4, $(subst ., , $(ECR_REPO_URI)))
REPO_NAME = $(lastword $(subst /, , $(ECR_REPO_URI)))
SHELL := /bin/bash

all: build_upload

build_upload:
	
	# ECR URI 포맷을 테스트하기 위한 정규식
	# regex for valid ecr uri format
	@REGEX='^[0-9]{12}\.dkr\.ecr\..+\.amazonaws\.com\/[a-z0-9_/-]+$$'; \

	if [[ $(ECR_REPO_URI) =~ $$REGEX ]]; then \
		echo "ECR URI 포맷 검사 통과"; else \
		echo "ECR URI 포맷 검사 실패"; \
		exit 1; \
	fi

	# ECR 로그인
	# ecr login
	aws ecr get-login-password --region $(REGION) | docker login --username AWS --password-stdin $(ECR_REPO_URI)

	# 도커 빌드
	# docker build
	docker build -t $(REPO_NAME) .
	docker tag $(REPO_NAME):latest $(ECR_REPO_URI):latest
	docker push $(ECR_REPO_URI):latest
	@echo Image URI in ECR repository: $(ECR_REPO_URI):latest

image:
	# 이미지 정의
	docker image build -t $(IMAGE_LABEL) .

run:
	docker run \
		--rm \
		--env-file $(ENV_FILE) \
		--name $(CONTAINER_NAME) \
		$(IMAGE_LABEL) 2>&1 | tee $(CONTAINER_NAME).log

.PHONY: all image run