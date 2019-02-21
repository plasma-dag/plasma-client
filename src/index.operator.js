#!/usr/bin/env node
"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const wl = require("./client/wallet");

const { Database } = require("./db");
const { Operator } = require("./client/operator");
const { Block, Header } = require("./core/block");
const { Transaction } = require("./core/transaction");
const { User } = require("./network/user");
// set environment variable
const http_port = process.env.HTTP_PORT || 3001; // > $env:HTTP_PORT=3003 (windows) || export HTTP_PORT=3003 (mac)

// REST API
async function initPlasmaOperator() {
  // Make Database Instance connected to local Mongo database
  const db = new Database();
  const operator = new Operator(db); // TODO: operator nonce management
  await operator.init();
  const app = express();

  app.use(bodyParser.json());
  app.use(morgan("dev"));

  app.post("/addUser", async function(req, res) {
    let { id, addr, ip } = req.body;
    const user = new User(id, addr, ip);
    await db.writeUser(user);
    res.send(`User added successfully: ${user.id}`);
  });
  app.get("/blockchains", function(req, res) {
    res.send(
      Object.keys(operator.blockchains).map(
        addr => operator.blockchains[addr].blockchain
      )
    );
  });
  app.get("/blockchain/:addr", function(req, res) {
    const address = req.param.addr;
    res.send(operator.blockchains[address]);
  });
  app.get("/potential/:addr", function(req, res) {
    const address = req.params.addr;
    res.send(operator.potentialDB.potentials[address]);
  });
  app.get("/states", function(req, res) {
    res.send(operator.stateDB.stateObjects);
  });
  app.get("/state/:addr", function(req, res) {
    const address = req.params.addr;
    res.send(operator.stateDB.stateObjects[address]);
  });
  app.get("/opNonce", function(req, res) {
    res.send({ opNonce: operator.opNonce });
  });
  // TODO: Mutex lock for opNonce may needed
  app.post("/block", async function(req, res) {
    const block = new Block(
      new Header(req.body.header.data),
      req.body.transactions.map(
        t => new Transaction(t.data.receiver, t.data.value)
      ),
      req.body.r,
      req.body.s,
      req.body.v
    );
    res.send(
      await operator.processBlock(block, "0x" + wl.getPrivateFromWallet())
    );
  });
  app.listen(http_port, function() {
    console.log("Listening http port on: " + http_port);
  });
}

// init Wallet before init Http server
wl.initWallet();
// Initiate plasma client
initPlasmaOperator();
