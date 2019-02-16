#!/usr/bin/env node
"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const wl = require("./client/wallet");

const { Database } = require("./db");
const { Operator } = require("./client/operator");

// set environment variable
const http_port = process.env.HTTP_PORT || 3001; // > $env:HTTP_PORT=3003 (windows) || export HTTP_PORT=3003 (mac)

// REST API
async function initPlasmaOperator() {
  // Make Database Instance connected to local Mongo database
  const db = new Database();
  const operator = new Operator(db); // TODO: operator nonce management
  await operator.init();
  const app = express();
  const senderUrl = "http://localhost:3000/sendProof";

  app.use(bodyParser.json());
  app.get("/blockchains", function(req, res) {
    res.send(operator.blockchains);
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
  app.get("currentOpNonce", function(req, res) {
    res.send(operator.opNonce);
  });
  // TODO: Mutex lock for opNonce may needed
  app.post(
    "/sendBlock",
    function(req, res, next) {
      if (req.body) {
        const block = req.body;
        next();
      }
    },
    //send checkpoint to sender
    async () => {
      const checkpoint = operator.processBlock(
        req.body,
        wl.getPrivateFromWallet()
      );
      await request.post(senderUrl, { form: ckeckpoint }),
        (err, response, body) => {
          if (err) {
            console.error(err);
            throw err;
          }
          //console.log(body);
        };
    }
  );

  app.listen(http_port, function() {
    console.log("Listening http port on: " + http_port);
  });
}

// init Wallet before init Http server
wl.initWallet();
// Initiate plasma client
initPlasmaOperator();
