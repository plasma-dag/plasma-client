"use-strict";

const express = require("express");
const axios = require("axios");
const api = express.Router();

const { User } = require("../network/user");

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
  const block = await miner.mineBlock(wl.getPrivateFromWallet());
  res.send(block);
});
api.post("/makeTx", function(req, res) {
  const { receiver, value } = req.body.data;
  const miner = req.app.locals.miner;
  const tx = miner.makeTx(receiver, value);
  res.send(tx);
});
api.post("/sendBlock", async function(req, res) {
  /**
   * 1. miner 객체에서 최신 블록을 갖고 온다.
   * 2. nw 객체에 구현된 sendToOperator(block) 함수 호출 (TODO)
   * 3. websocket의 response를 기다린 후, 성공, 실패 로직을 각각 실행한다.
   */
  const miner = req.app.locals.miner;
  const block = miner.getCurrentBlock();

  const db = req.app.locals.db;
  const operator = db.readUserById("operator");

  miner.pendBlock();
  let result = await axios.post(operator.ip + "/block", block);
  const checkpoint = result.body;
  if (checkpoint.error) {
    // Reset miner's data.
    throw new Error("ERROR");
  }
  miner.confirmBlock();

  const sender = checkpoint.address;
  if (!sender) throw new Error("ERROR");

  const miner = req.app.locals.miner;
  if (!block) throw new Error("ERROR");

  // checkpoint 검증
  result = validateCheckpoint(
    sender,
    checkpoint,
    block.header.hash(),
    opAddr // TODO: getOpAddr
  );
  if (result.error) throw new Error("ERROR");

  // checkpoint operator nonce 확인
  const bc = req.app.locals.bc;
  if (
    bc.checkpoint[bc.checkpoint.length - 1].operatorNonce >=
    checkpoint.operatorNonce
  )
    throw new Error("ERROR");

  // bc update
  const bc = req.app.locals.bc;
  bc.insertBlock(targetBlock);
  bc.updateCheckpoint(checkpoint);

  // block header에 있는 accountState로 state 반영
  const stateDB = req.app.locals.stateDB;
  stateDB.setState(
    block.header.accountState.address,
    block.header.accountState.account
  );

  // potential clear(모든 block hash list 다 받았기 때문에, block header에 포텐셜의 blockHashList 모두 넣지 않았을 경우 문제 발생)
  const potentialDB = req.app.locals.potentialDB;
  potentialDB.makeNewPotential(sender);

  // proof 생성
  const proofs = makeProof(checkpoint, block);
  result = await db.writeProof(proofs);
  if (result.error) throw new Error("ERROR");

  res.send(proofs);
});
api.post("/sendProof", async function(req, res) {
  //  const nw = req.app.locals.nw;

  // checkpoint 다루는 부분(proof생성까지) requestCheckpoint(sendBlock)로 이동 필요
  // sendBlock에서 블록 제출하고 operator부터 checkpoint return 받은 후 아래 logic 수행

  // TODO: 각 receiver에게 생성한 proof 전송

  // const { receiver, txHash } = req.body;
  // const txProof = "txproof"; // Make tx proof with tx, block header, checkpoint
  // const result = await nw.sendTxProof(txProof); // TODO\

  const { blockNonce, receiver } = req.body;
  const db = req.app.locals.db;
  const proof = db.readProof(blockNonce, receiver);
  const user = db.getUser(receiver);
  const result = await axios.post(user.ip + "/proof", proof);
  res.send(result);
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
