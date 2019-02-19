"use-strict";
const { Block, Header } = require("../src/core/block");
const { Transaction } = require("../src/core/transaction");
const { StateObject } = require("../src/core/state");
const { Account } = require("../src/core/account");
const { Checkpoint } = require("../src/core/checkpoint");
const { Database } = require("../src/db/index");

async function wait(promise, prefix) {
  let r = await promise;
  console.log(prefix);
  console.log(r);
  return;
}

let newAccount = new Account(11111, 13414, "");
let newAccount2 = new Account(12344, 132432, "");

let newTransaction = new Transaction(1, newAccount, 500000);
let newTransaction2 = new Transaction(1, newAccount2, 600000);
let newHeader = new Header(
  "dddddddddd",
  "",
  newTransaction.hash(),
  0,
  12,
  12314124,
  152,
  ""
);
let newHeader2 = new Header(
  "aaaaaaaa",
  "",
  newTransaction2.hash(),
  0,
  12,
  123425,
  13242,
  ""
);
let newHeader3 = new Header(
  "bbbb",
  "",
  newTransaction2.hash(),
  0,
  12,
  123425,
  13242,
  ""
);
let newBlock = new Block(newHeader, "signature", [newTransaction]);

let newBlock2 = new Block(newHeader2, "signature", [newTransaction]);

let newBlock3 = new Block(newHeader3, "signature", [newTransaction]);

let newState = new StateObject("addresstest", newAccount);

let newCheckpoint = new Checkpoint(
  newBlock.hash(),
  "aaaa",
  1,
  "operator signature2"
);

let newCheckpoint2 = new Checkpoint(newBlock2.hash(), "bbbb", 1, "sign2");

let newCheckpoint3 = new Checkpoint(newBlock2.hash(), "bbbb", 1, "sign3");
const db = new Database();

// wait(db.writeTx(newTransaction), 'write Tx: ');
// wait(db.readTx(newTransaction.hash()), 'read Tx: ');

// wait(db.writeBlock(newBlock), 'write block: ');
// wait(db.readBlock(newBlock.hash()), 'read block: ');

// wait(db.writeState(newState), 'write state: ');
// wait(db.readState("addresstest"))
// wait(db.readState(newState.getAddress()), 'read state: ');

// wait(db.writePotential(newState.address,[ newBlock.hash() ]), 'write potential: ');
// wait(db.readAllPotentials(), 'read potential: ');

//wait( db.writeCheckpoint( newCheckpoint ), 'write checkpoint: ' );
//wait(db.writeCheckpoint(newCheckpoint), 'write checkpoint: ');

//wait(db.readCheckpointWithBlockHash(newBlock.hash()), 'read checkpoint: ');

//wait( db.loadLastCheckpoint( "bbbb" ), `read address's last checkpoint:` );
