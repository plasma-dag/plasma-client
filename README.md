# plasma-client

## GitHub Page

https://plasma-dag.github.io/plasma-client/

## Testing guide(TEMP)

### 준비

1. Postman 같은 http query 보조 프로그램을 사용하면 좀더 편하게 테스트할 수 있다.

2. API들은 위 깃헙 페이지 링크를 참조할 수 있다.(아직 미완)

3. 가능하면 푸쉬는 테스팅이 끝난 뒤 할 수 있도록 한다. 커밋은 잘게 나누는게 권장됨.

### 현재 테스트 세팅

현재 테스트 세팅은 현실적인 문제로 굉장히 주먹구구식임을 양해바람.

1. 루트 폴더에서 node tests/fakeDB.js 명령을 통해 가짜 db를 만든다.

   이 때, operator는 'operator'라는 id를 갖고 3000번 포트의 ip 주소를 갖는다. wallet/3000/ 안의 private key를 갖는다. 또한 mongo db에서 '3000'이라는 db를 선언하고 안에 관련 정보들을 담는다.

   나머지 유저들은 각각 'userA', 'userB', 'userC'라는 id를 갖고 각각이 port number '3001','3002','3003'을 갖는다. operator와 마찬가지의 규칙으로 prvkey, mongo db database name을 갖는다.

   fakeDB.js에서는 userA, userB, userC의 genesis block을 만들고 이에 대한 operator의 체크포인트를 만든다.

   (* 문제가 생겨 db를 엎어야 할 땐, node tests/DeleteDBs.js 명령어를 통해 지울 수 있다.)

2. HTTP_PORT=3000 node src/index.operator.js 
   
   HTTP_PORT=3001 node src/index.user.js

   HTTP_PORT=3002 node src/index.user.js

   HTTP_PORT=3003 node src/index.user.js

   위와 같은 명령어를 각각 터미널에 입력해 4개의 node process를 띄워 작업할 수 있다.

3. 유저는 HTTP 통신을 통해 plasma DAG의 API를 이용할 수 있다.

   src/index.*.js, src/client/api.js 파일들을 참조해 어떤 요청을 보낼 수 있는지 확인할 수 있다.

### 테스트 예시

현재 development 브랜치에 푸쉬 될 프로젝트는 다음과 같은 시나리오 테스트를 통과했다. 이 이외의 테스트에서 문제가 생길 시 즉각적인 피드백을 권장함.

1. POST localhost:3001/api/makeTx 
  
  {

    "receiver": "0x05f41E57E84d8A239d433FC7026eCC0b6eCd704F",
    
    "value": 1
  
  }

2. POST localhost:3001/api/makeTx 
  
  {

    "receiver": "0x7349Fbaa12158E9750B6736712694935445b7091",
    
    "value": 1
  
  }

3. POST localhost:3001/api/startMiner

4. POST localhost:3001/api/mineBlock

5. POST localhost:3001/api/sendBlock

6. POST localhost:3001/api/sendProof

  {
    
    "blockNonce": 2,
    
    "receiverId": "userB"

  }

7. POST localhost:3002/api/makeTx

  {

    "receiver": "0x7349Fbaa12158E9750B6736712694935445b7091",
    
    "value": 1
  
  }

8. POST localhost:3002/api/makeTx

  {

    "receiver": "0xc33c4D08B16f52D3AF7DfE7De94CBc45b340Fd22",
    
    "value": 1
  
  }

9. POST localhost:3002/api/startMiner

10. POST localhost:3002/api/mineBlock

11. POST localhost:3002/api/sendBlock

이와 같은 작업을 거친 후, GET 명령어 등을 이용해 operator의 블록체인과 user A, user B의 블록체인이 같은 형태로 잘 유지되는지를 확인하는 작업을 거쳤다.

### 깃헙 규칙

1. 자신이 맡은 일에 대한 업무는 development 브랜치로부터 새로운 브랜치를 파서 작업

2. 위에 적혀져 있는 기본적인 테스트가 문제없이 돌아가는지 확인하고 각자 상황에 맞는 시나리오 테스트도 돌려본 후 모두 잘 될 때 풀 리퀘스트를 날리기. + 테스트를 추가했다면 추가한 테스트를 기술.

