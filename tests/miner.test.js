"use-strict";
const { Miner } = require("../src/miner/miner");
const { Blockchain } = require("../src/core/blockchain");
const { StateObject } = require("../src/core/state");
const { Database } = require("../src/db/index");
const { Account } = require("../src/core/account");
const { Potential } = require("../src/core/potential");
const { Checkpoint } = require("../src/core/checkpoint");
const { Header, Block } = require("../src/core/block");

const { MongoClient } = require("mongodb");

async function writeBlock(block, db) {
  block._id = block.hash();
  const blocks = db.collection("blocks");
  await blocks.insertOne(block);
}

async function writeCheckpoint(checkpoint, db) {
  const checkpoints = db.collection("checkpoints");
  await checkpoints.updateOne(
    { _id: checkpoint.blockHash },
    { $set: checkpoint },
    { upsert: true }
  );
}
describe("miner", () => {
  let connection;
  let db;

  beforeAll(async () => {
    db = new Database(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  it("should mine a new block", async () => {
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
      new Account(4, 300, ""),
      "",
      0,
      0,
      0
    );
    const block4 = new Block(header4, []);

    db.writeBlock(block1);
    db.writeBlock(block2);
    db.writeBlock(block3);
    db.writeBlock(block4);

    const checkpoint1 = new Checkpoint("dog", block1.hash(), 1);
    const checkpoint2 = new Checkpoint("dog", block2.hash(), 2);
    const checkpoint3 = new Checkpoint("dog", block3.hash(), 3);
    const checkpoint4 = new Checkpoint("dog", block4.hash(), 4);

    db.writeCheckpoint(checkpoint1);
    db.writeCheckpoint(checkpoint2);
    db.writeCheckpoint(checkpoint3);
    db.writeCheckpoint(checkpoint4);

    const account = new Account(5, 210, "");
    const state = new StateObject("dog", account, db);

    const bc = new Blockchain(db, "dog");
    const potential = new Potential(db, "dog", []);

    const miner = new Miner(db, bc, state, potential);
    // make txs that will be included in block #5  => include in newTxs
    miner.makeTx("human", 30);
    miner.makeTx("human", 40);
    miner.makeTx("cat", 20);

    const prvKey = "pvk";
    // mine 5th blocks with newTxs made above
    miner.start();
    const minedBlock = await miner.mineBlock(prvKey);
    db.writeBlock(minedBlock);

    const newBlock = await db.readBlock(minedBlock.blockHash);
    expect(newBlock).toEqual(minedBlock);
  });
});
