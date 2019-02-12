"use-strict";
const { Miner } = require("../src/miner/miner");
const { Blockchain } = require("../src/core/blockchain");
const { StateObject } = require("../src/core/state");
const { Database } = require("../src/db/index");
const { Account } = require("../src/core/account");
const { Potential } = require("../src/core/potential");
const { Checkpoint } = require("../src/core/checkpoint");
const { Header, Block } = require("../src/core/block");

const db = new Database();

// const header1 = new Header("", [], new Account(1, 0, ""), "", 0, 0, 0);
// const block1 = new Block(header1, []);

// const header2 = new Header(
//   block1.hash(),
//   [],
//   new Account(2, 0, ""),
//   "",
//   0,
//   0,
//   0
// );
// const block2 = new Block(header2, []);

// const header3 = new Header(
//     block2.hash(),
//     [],
//     new Account(3, 0, ""),
//     "",
//     0,
//     0,
//     0
//   );
//   const block3 = new Block(header3, []);

// const header4 = new Header(
// block3.hash(),
// [],
// new Account(4, 0, ""),
// "",
// 0,
// 0,
// 0
// );
// const block4 = new Block(header4, []);

// // write blocks and checkpoints in db
// const checkpoint1 = new Checkpoint("dog", block1.hash(), 1);
// const checkpoint2 = new Checkpoint("dog", block2.hash(), 2);
// const checkpoint3 = new Checkpoint("dog", block3.hash(), 3);
// const checkpoint4 = new Checkpoint("dog", block4.hash(), 4);
// db.writeBlock(block1);
// db.writeBlock(block2);
// db.writeBlock(block3);
// db.writeBlock(block4);

// db.writeCheckpoint(checkpoint1);
// db.writeCheckpoint(checkpoint2);
// db.writeCheckpoint(checkpoint4);
// db.writeCheckpoint(checkpoint3);

const account = new Account(5, 200, "");
const state = new StateObject("dog", account, db);

const bc = new Blockchain(db, "dog");
const potential = new Potential(db, "dog", []);

const miner = new Miner(bc, state, potential);

miner.makeTx("dog", 30);
miner.makeTx("dog", 40);
miner.makeTx("cat", 20);

const prvKey = "pvk";

async function main() {
  miner.start();
  const minedBlock = await miner.mineBlock(prvKey);
}
main();
