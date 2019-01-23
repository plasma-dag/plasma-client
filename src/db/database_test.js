#!/usr/bin/env node
"use-strict";
const { Block, Header } = require("../core/block");
const { StateObject } = require("../core/stateObject");
const { Account } = require("../core/account");
const { Database } = require("../db");

let newHeader = new Header(
    "dddddddddd",
    null,
    null,
    0,
    12,
    12314124,
    152,
    null
);

let newAccount = new Account(11111, 13414, null);

async function read_block_test(promise) {
    let a = await promise;
    console.log(a);
    return;
}

let newBlock = new Block(newHeader, "signature", []);
let newState = new StateObject("addresstest", newAccount);

const db = new Database();

// db.writeBlock(newBlock)
// .then(res => console.log(res))
// .catch(err => console.log(err));

read_block_test(db.readBlock(newBlock.hash()));

// db.writeState(newState)
// .then(res => console.log(res))
// .catch(err => console.log(err));

// db.readState(newState.getAddress)
// .then(res => console.log(res))
// .catch(err => console.log(err));
