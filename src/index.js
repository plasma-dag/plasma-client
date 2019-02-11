#!/usr/bin/env node
"use strict";
const express = require("express");
const bodyParser = require("body-parser");

const nw = require("./network");
const wl = require("./client/wallet");

const DataBase = require("./db");
const Blockchain = require("./core/blockchain");
const StateDB = require("./core/stateDB");
const Miner = require("./miner/miner");
const { PotentialDB } = require("./core/potential");

// set environment variable
const http_port = process.env.HTTP_PORT || 3001; // > $env:HTTP_PORT=3003 (windows) || export HTTP_PORT=3003 (mac)
const initialPeers = process.env.PEERS ? process.env.PEERS.split(",") : []; // > $env:PEERS = "ws://127.0.0.1:6001, ws://127.0.0.1:6002"

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
  // Return block list
  app.get("/blockchain", function(req, res) {
    res.send(bc.blockchain());
  });
  // Enable mining
  app.post("/startMiner", function(req, res) {
    miner.start();
    res.send("Started miner");
  });
  // Disable mining
  app.post("/stopMiner", function(req, res) {
    miner.stop();
    res.send("Stopped miner");
  });
  // Mine new block with current state, return mined block.
  app.post("/mineBlock", function(req, res) {
    const { data } = req.body;
    // miner object containes mined block hash value temporarily
    const block = miner.mineBlock(data);
    res.send(block);
  });
  app.post("/makeTx", function(req, res) {
    const { receiver, value } = req.body.data;
    const tx = miner.makeTx(receiver, value);
    res.send(tx);
  });
  app.post("/requestCheckpoint", async function(req, res) {
    const currentBlock = miner.getCurrentBlock();
    const checkpoint = await nw.requestCheckpoint(currentBlock);
    if (checkpoint) {
      // Reset miner's data.
      miner.refresh();
    }
    res.send(checkpoint);
  });
  app.post("/txProof", async function(req, res) {
    const txProof = "txproof"; // Make tx proof with tx, block header, checkpoint
    const result = await nw.sendTxProof(txProof);
    res.send(result);
  });
  app.get("/currentTxs", function(req, res) {
    res.send(miner.getTxs());
  });
  app.get("/minedBlock", function(req, res) {
    res.send(miner.getCurrentBlock());
  });
  app.get("/currentBlock", function(req, res) {
    res.send(bc.currentBlock);
  });
  app.get("/genesisBlock", function(req, res) {
    res.send(bc.genesisBlock);
  });
  app.get("/lastCheckpoint", function(req, res) {
    res.send(bc.checkpoint);
  });
  // Get peer list.
  app.get("/peers", function(req, res) {
    res.send(
      nw
        .getSockets()
        .map(s => s._socket.remoteAddress + ":" + s._socket.remotePort)
    );
  });
  app.post("/addPeer", function(req, res) {
    nw.connectToPeers(req.body.peer);
    res.send(`Peer added: ${req.body.peer}`);
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
    res.send("Wallet created");
  });
  app.post("/deleteWallet", function(req, res) {
    wl.deleteWallet();
    res.send("Wallet deleted");
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
if (process.env.OPERATOR) {
  nw.setOperatorConfig();
} else {
  nw.setUserConfig();
}
nw.initP2PServer();
