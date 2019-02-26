"use-strict";

const express = require("express");
const axios = require("axios");
const api = express.Router();

const { User } = require("../network/user");
const { Checkpoint } = require("../core/checkpoint");
const { makeProof, Proof } = require("../core/proof");

// Return block list
api.get("/blockchain", function(req, res) {
  const bc = req.app.locals.bc;
  res.send(bc.blockchain);
});
// Enable mining
api.post("/startMiner", function(req, res) {
  const miner = req.app.locals.miner;
  miner.start();
  res.send("Started miner");
});
// Disable mining
api.post("/stopMiner", function(req, res) {
  const miner = req.app.locals.miner;
  miner.stop();
  res.send("Stopped miner");
});
// Mine new block with current state, return mined block.
api.post("/mineBlock", async function(req, res) {
  const { miner, wl } = req.app.locals;
  // miner object containes mined block hash value temporarily
  const block = await miner.mineBlock("0x" + wl.getPrivateFromWallet());
  res.send(block);
});
api.post("/makeTx", async function(req, res) {
  const { receiver, value } = req.body;
  const miner = req.app.locals.miner;
  const tx = await miner.makeTx(receiver, value);
  res.send(tx);
});
api.post("/sendBlock", async function(req, res) {
  /**
   * 1. miner 객체에서 최신 블록을 갖고 온다.
   * 2. nw 객체에 구현된 sendToOperator(block) 함수 호출 (TODO)
   * 3. websocket의 response를 기다린 후, 성공, 실패 로직을 각각 실행한다.
   */
  const { miner, db, bc, stateDB, potentialDB } = req.app.locals;
  const block = miner.currentBlock;
  if (!block) return res.send("Mined block doesn't exist");

  const operator = await db.readUserById("operator");

  miner.pendBlock();
  let result = await axios.post(operator.ip + "/block", block);
  const checkpoint = new Checkpoint(
    result.data.address,
    result.data.blockHash,
    result.data.operatorNonce,
    result.data.r,
    result.data.s,
    result.data.v
  );

  if (checkpoint.error) {
    // Reset miner's data.
    return res.send(checkpoint);
  }
  miner.confirmBlock();
  console.log(result);

  const sender = checkpoint.address;
  if (!sender) return res.send("checkpoint doesn't have sender");

  // checkpoint 검증
  result = checkpoint.validate(operator.addr);
  if (result.error)
    return res.send("Checkpoint validation failed: ", result.error);

  // checkpoint operator nonce 확인
  if (bc.opNonce >= checkpoint.operatorNonce)
    return res.send("Operator nonce is lower than recent one");

  // bc update
  await bc.insertBlock(block);
  bc.updateCheckpoint(checkpoint);
  miner.bc = bc;

  // block header에 있는 accountState로 state 반영
  await stateDB.setState(block.sender, block.account);

  // potential clear(모든 block hash list 다 받았기 때문에, block header에 포텐셜의 blockHashList 모두 넣지 않았을 경우 문제 발생)
  result = await potentialDB.makeNewPotential(sender);
  res.send(result);
});
api.post("/sendProof", async function(req, res) {
  const { blockNonce, receiverStr } = req.body;
  const { db, bc } = req.app.locals;
  // Make proof
  let receiver = await db.readUserById(receiverStr);
  if (!receiver) {
    receiver = await db.readUserByAddress(receiverStr);
  }
  if (!receiver) {
    return res.send("User doesn't exist");
  }
  const targetBlock = bc.getBlockByNumber(blockNonce);
  if (!targetBlock) {
    return res.send("Block nonce is invalid one");
  }
  const targetTx = targetBlock.transactions.find(
    tx => tx.data.receiver === receiver.address
  );
  if (!targetTx) {
    return res.send("Block doesn't have receiver related tx");
  }
  const targetCheckpoint = await db.readCheckpointWithBlockHash(
    targetBlock.hash
  );
  if (!targetCheckpoint) {
    return res.send("Checkpoint doesn't exist");
  }
  const proof = makeProof(targetTx, targetBlock, targetCheckpoint);
  try {
    const result = await axios.post(receiver.ip + "/proof", proof);
    return res.send(result.data);
  } catch (error) {
    return res.send(error);
  }
});
api.get("/potentials", function(req, res) {
  const { potentialDB, addr } = req.app.locals;
  res.send(potentialDB.potentials[addr]);
});
api.get("/state", async function(req, res) {
  const { stateDB, addr } = req.app.locals;
  res.send(await stateDB.getStateObject[addr]);
});
api.get("/currentTxs", function(req, res) {
  const miner = req.app.locals.miner;
  res.send(miner.getTxs);
});
api.get("/minedBlock", function(req, res) {
  const miner = req.app.locals.miner;
  console.log(miner.curBlock);
  res.send(miner.curBlock);
});
api.get("/currentBlock", function(req, res) {
  const bc = req.app.locals.bc;
  res.send(bc.currentBlock);
});
api.get("/genesisBlock", function(req, res) {
  const bc = req.app.locals.bc;
  res.send(bc.genesisBlock);
});
api.get("/lastCheckpoint", function(req, res) {
  const bc = req.app.locals.bc;
  res.send(bc.checkpoint);
});
api.get("/userList", function(req, res) {
  const userList = req.app.locals.userList;
  res.send(userList);
});
/**
 * data { body: userId, addr, ip }
 */
api.post("/addUser", async function(req, res) {
  const { userList, db } = req.app.locals;
  const newUser = new User(req.body.userId, req.body.addr, req.body.ip);
  const index = userList.findIndex(user => user.addr === newUser.addr);
  if (index !== -1) {
    // Already known user
    userList[index] = newUser;
    await db.updateUser(newUser); // TODO
    return res.send(`User updated: ${newUser.userId}`);
  }
  userList.push(newUser);
  await db.addUser(newUser); // TODO
  res.send(`User added: ${newUser.userId}`);
});
api.get("/address", function(req, res) {
  const wl = req.app.locals.wl;
  const address = wl.getPublicFromWallet().toString();
  if (address != "") {
    res.send({ address: address });
  } else {
    res.send();
  }
});
api.post("/createWallet", function(req, res) {
  const wl = req.app.locals.wl;
  wl.createWallet();
  res.send("Wallet created");
});
api.post("/deleteWallet", function(req, res) {
  const wl = req.app.locals.wl;
  wl.deleteWallet();
  res.send("Wallet deleted");
});
api.post("/stop", function(req, res) {
  res.send({ msg: "Stopping server" });
  process.exit();
});

module.exports = api;
