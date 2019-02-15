#!/usr/bin/env node
"use strict";
const express = require("express");
const bodyParser = require("body-parser");

const nw = require("./network");
const wl = require("./client/wallet");

const api = require("./client/api");
const { Database } = require("./db");
const { Blockchain } = require("./core/blockchain");
const { StateDB } = require("./core/stateDB");
const { Miner } = require("./miner/miner");
const { PotentialDB } = require("./core/potential");
const { validateCheckpoint } = require("./core/validator");

// set environment variable
const http_port = process.env.HTTP_PORT || 3001; // > $env:HTTP_PORT=3003 (windows) || export HTTP_PORT=3003 (mac)

// REST API
async function initPlasmaClient() {
  // Make Database Instance connected to local Mongo database
  const db = new Database();
  const addr = wl.getPublicFromWallet().toString();
  // Make blockchian object and initiate it.
  const bc = new Blockchain(db, addr);
  await bc.init();
  // Make stateDB object
  const stateDB = new StateDB(db);
  // TODO: If state object doesn't exist in user's database, should user ask it to op?
  if (!stateDB.isExist(addr)) {
    stateDB.makeNewState(addr);
  }
  // Make potentialDB object
  const potentialDB = new PotentialDB(db);
  // If potential for user addr doesn't exist make blank potential object
  if (!potentialDB.potentials[addr]) {
    potentialDB.makeNewPotential(addr);
  }
  // Set miner object for user address
  const miner = new Miner(
    bc,
    stateDB.getStateObject(addr),
    potentialDB.potentials[addr]
  );
  let userList = await this.db.getUserList();
  const proofList = [];

  const app = express();

  app.locals = {
    ...locals,
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
  app.use("/api", api);

  // Server logics
  /**
   * Sender post his/her tx proof to receiver.
   * Receiver takes it and validate it.
   */
  app.post("/proof", function(req, res) {
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

    const { proof } = req.body;
    // 1
    let result = proof.validate();
    if (result.error) throw new Error("ERROR");

    // 2
    result = validateCheckpoint(
      proof.blockHeader.accountState.address,
      proof.checkpoint,
      proof.blockHeader.hash(),
      opAddr // TODO: getOpAddr
    );
    if (result.error) throw new Error("ERROR");

    // 3
    result = proofList.find(proof => {
      proof.blockHeader.hash() === proof.blockHeader.hash();
    });
    if (result.error) throw new Error("ERROR");

    // 4
    result = proof.merkleProof();
    if (result.error) throw new Error("ERROR");

    // 5
    result = potentialDB.sendPotential(
      proof.blockHeader.hash(),
      proof.tx.receiver
    );
    if (result.error) throw new Error("ERROR");

    // 6
    proofList.push(proof);
    res.send(proof);
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
// Set network config with operator IP address
nw.setUserConfig(process.env.OPERATOR_IP);
// Initiate WebSocket server
nw.initP2PServer();
