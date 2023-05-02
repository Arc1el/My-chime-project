# ECS Cluster

<aside>
💡 ECS 클러스터 작업은 반드시 VPC구성 및 ECR 레포지토리에 태스크의 각 컨테이너에 사용할 도커 이미지가 푸시되어있음을 선행조건으로 따릅니다.

</aside>

## 1. 태스크 정의

---

1. 태스크 정의 생성
    - **새 태스크 정의 생성 → 새 태스크 정의 생성**
        
        ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled.png)
        
    - **태스크 정의 구성**
        - 패밀리는 여러개의 개정된 태스크를 가지고있는 태스크의 집합입니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%201.png)
            
    - **컨테이너 설정**
        - 컨테이너의 이름과 이미지, 포트 매핑등을 설정합니다. 임의로 환경변수를 추가할 수 있습니다.
        - ⚠️ 본 프로젝트에서 “컨테이너 이름” 은 CI/CD 파이프라인의 output 아티팩트인 imagedefinitions.json의 “컨테이너 이름” 과 일치해야 합니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%202.png)
            
        - 환경변수 설정을  통해 AWS Credentials 정보를 제공합니다.
        엔트리포인트, 커맨드 등을 설정합니다. 본 프로젝트는 따로 설정이 필요하지는 않습니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%203.png)
            
        - ⚠️ API키를 외부에 유출되지 않도록 조심하세요.
    - **환경, 스토리지, 모니터링 및 태그 구성**
        - OS, 태스크 크기, 태스크역할을 지정합니다. 환경에 맞게 스펙을 조정합니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%204.png)
            
        - 스토리지 설정 (선택사항)
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%205.png)
            
        - 모니터링 및 로깅 설정 (선택사항)
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%206.png)
            
    - 검토 및 생성
        - 설정을 검토 한 후 태스크를 생성합니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%207.png)
            
        - 생성된 태스크를 확인합니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%208.png)
            

## 2. 클러스터 생성

---

1. 클러스터 생성
    - 클러스터를 생성합니다. 클러스터는 이전에 정의한 태스크를 실행시키는 태스크의 그룹입니다.
        
        ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%209.png)
        
    - 클러스터 구성 및 네트워킹
        - 클러스터 이름과 생성한 VPC를 지정합니다. 멀티 AZ구성을 위해 각각의 AZ에 구성된 서브넷을 선택합니다. 본 프로젝트에서는 Pub1, 2를 지정해주었습니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2010.png)
            
        - 클러스터는 CloudFormation 을 사용하여 자동으로 스택 형태로 생성되게 됩니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2011.png)
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2012.png)
            

## 3. 서비스 등록

---

1. 생성된 클러스터에 서비스를 등록합니다. 서비스로 이전에 생성한 태스크를 지정합니다.
    - 클러스터 명을 클릭합니다.
        
        ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2013.png)
        
    - 서비스를 생성합니다.
        - 서비스 생성
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2014.png)
            
        - 환경설정
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2015.png)
            
        - 배포구성
            - 애플리케이션 유형 : 서비스
            - 태스크 정의 : 기존에 생성했던 태스크 패밀리를 지정합니다.
            - 서비스 이름 : 서비스 이름을 지정합니다.
            - 원하는 태스크 : 시작할 태스크의 갯수를 설정합니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2016.png)
            
        - 로드밸런싱
            - 유형을 설정합니다. 본 프로젝트는 http/https를 사용하므로 ALB로 설정합니다.
                
                ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2017.png)
                
            - 리스너와 태스크 그룹을 생성합니다. 새로 생성합니다.
                - 헬스체크 경로가 있는경우 지정합니다.
                    
                    ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2018.png)
                    
            - (선택) ASG 오토스케일링 그룹을 사용하고자 하는경우 설정합니다.
                
                ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2019.png)
                
        - 클라우드 포메이션으로 스택형태로 배포됩니다.
            
            ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2020.png)
            

## 4. 접속테스트

---

1. 헬스체크 URL을 사용하여 정상적으로 동작하는지 확인합니다.
    - ALB DNS 이름으로 접속합니다.
        
        ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2021.png)
        
    - 헬스체크 URL에 접속하여 200 Res를 응답하는지 확인합니다.
        
        ![Untitled](ECS%20Cluster%2029e6f38b36b4461aad8667ba5d504ab9/Untitled%2022.png)
        

## References

---

[Amazon ECS 태스크 정의 - Amazon Elastic Container Service](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/developerguide/task_definitions.html)