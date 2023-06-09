# Meetings App using Amazon Chime SDK

![ChimeProject-Whole.jpg](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/ChimeProject-Whole.jpg)

[Amazon Chime SDK PT.pdf](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/Amazon_Chime_SDK_PT.pdf)

## 1. VPC 구성

---

![ChimeProject-VPC.jpg](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/ChimeProject-VPC.jpg)

1. VPC 생성
    
    ![Untitled](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/Untitled.png)
    
    - Multi-AZ 생성
    - 서브넷 구성
2. ECR 이미지 레포지토리
    
    [ECR ](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/ECR%20c3cc924fe3e0448d892e60b033bc4722.md)
    
3. ECS 클러스터
    
    [ECS Cluster](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9.md)
    
    ![Untitled](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/Untitled%201.png)
    
    - ECS 클러스터 (태스크, 서비스)
    - ASG 오토스케일링 그룹
    - ALB 애플리케이션 로드밸런서

## 2. CI/CD Pipeline

---

![ChimeProject-CI_CD.jpg](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/ChimeProject-CI_CD.jpg)

1. CodeBuild를 사용한 프로젝트 빌드
    
    [CodeBuild](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/CodeBuild%20226e6a2b17ab4aae8302df69a17fcda8.md)
    
2. CodePipeline을 사용하여 프로젝트 배포
    
    [CodePipeline](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/CodePipeline%20c09dcd0e9a934b5ab45ee0449c64c76f.md)
    

## 3. Chime SDK Logic

---

![Untitled](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/Untitled%202.png)

1. ChimeSDK API 통신
    
    [ChimeSDK Logic](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/ChimeSDK%20Logic%20948c263153a84971b1b9bc9b951837c2.md)
    

## 4. Demo

---

![Untitled](Meetings%20App%20using%20Amazon%20Chime%20SDK%20c5c46d3f07d7466abf4cfba54011d133/Untitled%203.png)