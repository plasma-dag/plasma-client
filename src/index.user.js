#!/usr/bin/env node
"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const nw = require("./network");
const wl = require("./client/wallet");

const api = require("./client/api");
const { Database } = require("./db");
const { Blockchain } = require("./core/blockchain");
const { Header, Block } = require("./core/block");
const { Transaction } = require("./core/transaction");
const { StateDB } = require("./core/state");
const { Miner } = require("./miner/miner");
const { PotentialDB } = require("./core/potential");
const { Checkpoint } = require("./core/checkpoint");
const { Proof } = require("./core/proof");
const { validateCheckpoint } = require("./core/validator");
const { privateKeyToAccount } = require("./crypto");

// set environment variable
const http_port = process.env.HTTP_PORT || 3001; // > $env:HTTP_PORT=3003 (windows) || export HTTP_PORT=3003 (mac)

// REST API
async function initPlasmaClient() {
  // Make Database Instance connected to local Mongo database
  const db = new Database();
  const addr = privateKeyToAccount("0x" + wl.getPrivateFromWallet()); // TODO: 0x 통일 할지
  console.log("address of this user: ", addr);
  // Make blockchian object and initiate it.
  const bc = new Blockchain(db, addr);
  await bc.init();
  // Make stateDB object
  const stateDB = new StateDB(db);
  // TODO: If state object doesn't exist in user's database, should user ask it to op?
  let stateExist = await stateDB.isExist(addr);
  if (!stateExist) {
    if (bc.currentBlock) {
      await stateDB.setState(addr, bc.currentBlock.header.data.accountState);
    } else {
      await stateDB.makeNewState(addr);
    }
  }
  // Make potentialDB object
  const potentialDB = new PotentialDB(db);
  await potentialDB.populate();
  // If potential for user addr doesn't exist make blank potential object
  if (!potentialDB.potentials[addr]) {
    potentialDB.makeNewPotential(addr);
  }
  // Set miner object for user address
  const miner = new Miner(db, bc, stateDB, potentialDB);
  let userList = await db.getUserList();
  const proofList = await db.readAllProof();
  const app = express();

  app.locals = {
    ...app.locals,
    addr,
    db,
    bc,
    stateDB,
    potentialDB,
    miner,
    userList,
    nw,
    wl
  };
  app.use(bodyParser.json());
  app.use(morgan("dev"));
  app.use("/api", api);

  // Server logics
  /**
   * Sender post his/her tx proof to receiver.
   * Receiver takes it and validate it.
   */
  app.post("/proof", async function(req, res) {
    /**
     * 1. Proof 객체를 받으면 proof의 valid 여부를 검증
     * 2. checkpoint 검증
     * 3. Proof가 기존에 받았던 proof list에 존재하는지도 검증
     * 4. merkleProof
     * 5. Proof 검증이 끝나면 potentialDB를 업데이트. 문제점: potential에는 value 값이
     *    안들어가있는 형태이다. 따라서 불완전한 형태의 block을 db에 저장해둬야함. 이때 그 블록
     *    은 receiver에게 유효한 tx 하나를 갖고 있는 구조가 될 것이다.
     * 6. prooflist에 proof 추가
     */

    const proof = req.body;
    const prf = new Proof(
      new Transaction(proof.tx.data.receiver, proof.tx.data.value),
      proof.merkleProof,
      proof.merkleRoot,
      proof.merkleDeps,
      new Checkpoint(
        proof.checkpoint.address,
        proof.checkpoint.blockHash,
        proof.checkpoint.operatorNonce,
        proof.checkpoint.r,
        proof.checkpoint.s,
        proof.checkpoint.v
      ),
      new Header(proof.blockHeader.data),
      proof.r,
      proof.s,
      proof.v
    );
    // 1
    let result = prf.validate();
    if (result.error) return res.send("Invalid form of proof");
    const operator = await db.readUserById("operator");
    // 2
    result = validateCheckpoint(
      prf.sender,
      prf.checkpoint,
      prf.blockHash,
      operator.addr
    );
    if (result.error) return res.send("Invalid checkpoint");
    console.log(proofList);
    // 3
    result = proofList.find(p => {
      return prf.blockHash === p.data.blockHeader.blockHash; // TODO: proof 저장되어 있는 놈에서 hash 만드는거...
    });
    console.log(result);
    if (result) return res.send("Proof already exist");
    // 4
    result = prf.merkleProof();
    if (result.error) return res.send({ error: "Invalid merkle proof" });
    // 5
    try {
      await potentialDB.sendPotential(prf.blockHash, prf.tx.receiver);
    } catch (error) {
      console.error("Send potential failed"); // TODO: 이것만 리시버 입장에서 fail. 어떻게 할지
    }
    const block = new Block(prf.blockHeader, [prf.tx]);
    try {
      await db.writeBlock(block);
    } catch (error) {
      console.error("Block save failed");
    }
    // 6
    proofList.push(proof);
    try {
      await db.writeProof([prf]);
      res.send("Proof proved successfully");
    } catch (error) {
      res.send("Writing proof failed");
    }
  });
  app.get("/blockchain", function(req, res) {
    res.send(bc);
  });
  app.listen(http_port, function() {
    console.log("Listening http port on: " + http_port);
  });
}

// init Wallet before init Http server
wl.initWallet();
// Initiate plasma client
initPlasmaClient();
