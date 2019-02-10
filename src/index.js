#!/usr/bin/env node
"use strict";
const express = require("express");
const bodyParser = require("body-parser");

const nw = require("./network");
const wl = require("./client/wallet");

const DataBase = require("./db");
const Blockchain = require("./core/blockchain");
const StateDB = require("./core/stateDB");
const StateObject = require("./core/stateObject");
const Account = require("./core/account");
const Worker = require("./miner/worker");
const Miner = require("./miner/miner");
const { PotentialDB, Potential } = require("./core/potential");
const { Operator, UserTransfer } = require("./core/transfer");

// set environment variable
const http_port = process.env.HTTP_PORT || 3001; // > $env:HTTP_PORT=3003 (windows) || export HTTP_PORT=3003 (mac)
const initialPeers = process.env.PEERS ? process.env.PEERS.split(",") : []; // > $env:PEERS = "ws://127.0.0.1:6001, ws://127.0.0.1:6002"

var userTransfer;
var operator;
// REST API
function initPlasmaClient(opAddr) {
  // Make Database Instance connected to local Mongo database
  const db = new DataBase();
  const addr = wl.getPublicFromWallet().toString();
  // Make blockchian object and initiate it.
  const bc = new Blockchain(db, addr);
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

  const app = express();
  app.use(bodyParser.json());

  app.get("/blockchain", function(req, res) {
    res.send(bc.blockchain());
  });
  app.get("/checkpoints", function(req, res) {
    userTransfer.checkpoints = nw.getCheckpoints();
    res.send(userTransfer.checkpoints);
  });
  app.get("/confirmedCheckpoints", function(req, res) {
    userTransfer.confirmedCheckpoints = nw.getConfirmedCheckpoints();
    res.send(userTransfer.confirmedCheckpoints);
  });
  app.get("/submittedBlock", function(req, res) {
    operator.submittedBlock = nw.getSubmittedBlocks();
    res.send(operator.submittedBlock);
  });
  app.post("/makeTx", function(req, res) {
    const receiver = req.body.data.receiver;
    const value = req.body.data.value;
    const tx = worker.makeTx(receiver, value); // TODO
    //const tx = userTransfer.makeTransaction(receiver, value);
    res.send(tx);
  });
  app.post("/mineBlock", function(req, res) {
    const opAddr = nw.getOpAddr();
    const block = worker.makeBlock(); // TODO
    //const block = userTransfer.makeBlock(prvKey, opAddr);
    const message = {
      type: processBlock,
      data: {
        block: block
      }
    };
    const ws = nw.getWebsocket(opAddr);
    nw.write(ws, message);
    res.send(message);
    // const newBlock = bc.generateNextBlock(req.body.data || "");
    // bc.addBlock(newBlock);
    // nw.broadcast(nw.responseLatestMsg());
    // console.log("Block added: " + JSON.stringify(newBlock));
    // res.send();
  });
  // app.post("/processBlock", function(req, res) {

  // });
  // app.post("/confirmSend", function(req, res) {
  //   const checkpoint = req.checkpoint;
  //   const block = userTransfer.confirmSend(checkpoint, opAddr);
  //   if(block.error) console.log("send confirmation error");
  //   else {
  //     const deps = block.transactions.length;
  //     block.transactions.forEach( (tx, index) => {
  //       let ws = nw.getWs(tx.receiver);
  //       let message = {
  //         type: CONFIRM_RECEIVE,
  //         data: {
  //           checkpoint: checkpoint,
  //           header: block.header,
  //           deps: deps,
  //           proof: merkleProof(this.leaves, index),
  //           root: block.header.merkleHash,
  //           tx: tx
  //         }
  //       };
  //       nw.write(ws, message);
  //     });
  //     res.send(block);
  //   }
  // });
  // app.post("/confirmReceive", function(req, res) {
  //   const data = {
  //     checkpoint = req.body.checkpoint,
  //     header = req.body.header,
  //     deps = req.body.deps,
  //     proof = req.body.proof,
  //     root = req.body.root,
  //     tx = req.body.tx,
  //     opAddr = req.body.opAddr
  //   };
  //   const result = userTransfer.confirmReceive(data);
  //   res.send(result);
  // });
  app.get("/peers", function(req, res) {
    res.send(
      nw
        .getSockets()
        .map(s => s._socket.remoteAddress + ":" + s._socket.remotePort)
    );
  });
  app.post("/addPeer", function(req, res) {
    nw.connectToPeers([req.body.peer]);
    res.send();
  });
  app.get("/address", function(req, res) {
    const address = wl.getPublicFromWallet().toString();
    if (address != "") {
      res.send({ address: address });
    } else {
      res.send();
    }
  });
  app.post("/createWallet", function(req, res) {
    wl.createWallet();
    res.send();
  });
  app.post("/deleteWallet", function(req, res) {
    wl.deleteWallet();
    res.send();
  });
  app.post("/stop", function(req, res) {
    res.send({ msg: "Stopping server" });
    process.exit();
  });
  app.listen(http_port, function() {
    console.log("Listening http port on: " + http_port);
  });
}

// main
nw.connectToPeers(initialPeers);
// init Wallet before init Http server
wl.initWallet();
initPlasmaClient("0xdfdfdfdfdfdddffdf");
nw.initSet(ws, addr, userTransfer);
if (process.env.OPERATOR) {
  nw.initOpSet();
} else {
}

nw.initP2PServer();
