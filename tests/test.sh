#!/bin/bash

curl -H "Content-Type: application/json" -X POST \
--data '{"receiver": "0x7349Fbaa12158E9750B6736712694935445b7091", "value": 1}' \
localhost:3001/api/makeTx;

curl -H "Content-Type: application/json" -X POST \
--data '{"receiver": "0xc33c4D08B16f52D3AF7DfE7De94CBc45b340Fd22", "value":1}' \
localhost:3001/api/makeTx;

curl -X POST localhost:3001/api/startMiner;

curl -X POST localhost:3001/api/mineBlock;

curl -X POST localhost:3001/api/sendBlock;

curl -H "Content-Type: application/json" -X POST \
--data '{"blockNonce":2, "receiverId": "userB"}' \
localhost:3001/api/sendProof;

curl -H "Content-Type: application/json" -X POST \
--data '{"receiver": "0x7349Fbaa12158E9750B6736712694935445b7091", "value": 1}' \
localhost:3002/api/makeTx;

curl -H "Content-Type: application/json" -X POST \
--data '{"receiver": "0xc33c4D08B16f52D3AF7DfE7De94CBc45b340Fd22", "value":1}' \
localhost:3002/api/makeTx;

curl -X POST localhost:3002/api/startMiner;
curl -X POST localhost:3002/api/mineBlock;
curl -X POST localhost:3002/api/sendBlock;

