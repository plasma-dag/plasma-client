"use-strict";
const { Blockchain } = require("../src/core/blockchain");
const { Header, Block } = require("../src/core/block");
const { Checkpoint } = require("../src/core/checkpoint");
const { Account } = require("../src/core/account");
const { Database } = require("../src/db/index");

//make db instance
const db = new Database();

// 4 blocks, 4 checkpoints
const header1 = new Header("", [], new Account(1, 0, ""), "", 0, 0, 0);
const block1 = new Block(header1, []);

const header2 = new Header(
  block1.hash(),
  [],
  new Account(2, 0, ""),
  "",
  0,
  0,
  0
);
const block2 = new Block(header2, []);

const header3 = new Header(
  block2.hash(),
  [],
  new Account(3, 0, ""),
  "",
  0,
  0,
  0
);
const block3 = new Block(header3, []);

const header4 = new Header(
  block3.hash(),
  [],
  new Account(4, 0, ""),
  "",
  0,
  0,
  0
);
const block4 = new Block(header4, []);

//write blocks and checkpoints in db
// const checkpoint1 = new Checkpoint("chan", block1.hash(), 1);
// const checkpoint2 = new Checkpoint("chan", block2.hash(), 2);
// const checkpoint3 = new Checkpoint("chan", block3.hash(), 3);
// const checkpoint4 = new Checkpoint("chan", block4.hash(), 4);
// db.writeBlock(block1);
// db.writeBlock(block2);
// db.writeBlock(block3);
// db.writeBlock(block4);

// db.writeCheckpoint(checkpoint1);
// db.writeCheckpoint(checkpoint2);
// db.writeCheckpoint(checkpoint4);
// db.writeCheckpoint(checkpoint3);

//check if it works - assign 1st value to checkpoint, 2nd value to blocks

async function main() {
  const sample_blockchain = new Blockchain(db, "chan");
  await sample_blockchain.init();
  console.log(sample_blockchain.checkpoint);
  console.log(sample_blockchain.blocks);
  console.log(sample_blockchain.currentBlock);
  console.log(sample_blockchain.genesisBlock);
}
main();
