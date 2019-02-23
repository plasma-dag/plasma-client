#!/bin/bash

curl -H "Content-Type: application/json" -X POST \
--data '{"receiver": "userB", "value": 1}' \
localhost:3001/api/makeTx 2<&1;
curl -H "Content-Type: application/json" -X POST \
--data '{"receiver": "userA", "value":1}' \
localhost:3001/api/makeTx 2<&1;
curl -X POST localhost:3001/api/startMiner 2<&1; 
curl -X POST localhost:3001/api/mineBlock 2<&1; 
curl -X POST localhost:3001/api/sendBlock 2<&1;
curl -H "Content-Type: application/json" -X POST \
--data '{"blockNonce":2, "receiver": "0x7349Fbaa12158E9750B6736712694935445b7091"}' \
localhost:3001/api/sendProof 2<&1;
curl -H "Content-Type: application/json" -X POST \
--data '{"receiver": "userB", "value": 1}' \
localhost:3002/api/makeTx 2<&1;
curl -H "Content-Type: application/json" -X POST \
--data '{"receiver": "userA", "value":1}' \
localhost:3002/api/makeTx 2<&1;
curl -X POST localhost:3002/api/startMiner 2<&1;
curl -X POST localhost:3002/api/mineBlock 2<&1;
curl -X POST localhost:3002/api/sendBlock 2<&1;
 

