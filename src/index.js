#!/usr/bin/env node
"use strict";
const express = require("express");
const bodyParser = require("body-parser");


const nw = require("./network");
const wl = require("./client/wallet");

const DataBase = require("./db/index");
const Blockchain = require("./core/blockchain");
const StateDB = require("./core/stateDB");
const StateObject = require("./core/stateObject");
const Account = require("./core/account");
const Worker = require("./miner/worker");
const { PotentialDB, Potential } = require("./core/potential");
const { Operator, UserTransfer } = require("./core/transfer");

// set environment variable
const http_port = process.env.HTTP_PORT || 3001; // > $env:HTTP_PORT=3003 (windows) || export HTTP_PORT=3003 (mac)
const initialPeers = process.env.PEERS ? process.env.PEERS.split(",") : []; // > $env:PEERS = "ws://127.0.0.1:6001, ws://127.0.0.1:6002"

var userTransfer;
var operator;
// REST API
function initHttpServer() {
  
  const db = new DataBase();
  const addr = wl.getPublicFromWallet().toString();
  const bc = new Blockchain(db, addr); 
  const state = new StateObject(addr, new Account(0, 0, undefined), db);
  const potential = new Potential(db, addr, []);
  //const miner = new Miner(db, bc, state, potential);
  const worker = new Worker(); // TODO: opts?
  userTransfer = new UserTransfer(db, bc, state, potential);

  if(op) { // TODO: file or option
    const stateDB = new StateDB(db);
    const potentialDB = new PotentialDB(db);
    operator = new Operator(db, stateDB, potentialDB, state);
  }


  const app = express();
  app.use(bodyParser.json());

  app.get("/blocks", function(req, res) {
    res.send(bc.getBlockchain());
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
initHttpServer();
nw.initSet(ws, addr, userTransfer);
if(op) nw.initOpSet(operator, addr);
nw.initP2PServer();

