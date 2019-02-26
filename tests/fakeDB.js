/**
 * This file should make operator, user A, user B, user C's
 * block, tx, state, checkpoint etc in their own database
 *            dbName
 * operator   3000
 * userA      3001
 * userB      3002
 * userC      3003
 */

// Plasma DAG modules
const { Block, Header, signBlock } = require("../src/core/block");
const { Checkpoint, signCheckpoint } = require("../src/core/checkpoint");
const { StateObject } = require("../src/core/state");
const { Account } = require("../src/core/account");
const { Database } = require("../src/db");
const { User } = require("../src/network/user");
const { privateKeyToAccount } = require("../src/crypto");

async function main() {
  // DB Setting
  const portOp = "3000",
    portA = "3001",
    portB = "3002",
    portC = "3003";

  const dbOp = new Database(portOp),
    dbA = new Database(portA),
    dbB = new Database(portB),
    dbC = new Database(portC);

  // Private Keys
  const prvOp =
    "0x1c2b1657ce0631088b39278c6a4e7f8830a3b129128179cffc7c9c84ecb78b4e";
  const prvA =
    "0x54562fa8a0e42b24fef6d3b06eed1204d56afc6058a4e92301ca1e814a89d251";
  const prvB =
    "0x13121a9295ec1a3d050b5948b2940c7dda31ce1f3fa8c7564f7e6cf6e7c231b7";
  const prvC =
    "0x1f3b31ccc98ea0fcac67fbc7d8834388d823a3dc9e633d8a0c8e34ee67c10491";

  // User setting
  const operator = new User(
    "operator",
    privateKeyToAccount(prvOp),
    `http://localhost:${portOp}`
  );
  const userA = new User(
    "userA",
    privateKeyToAccount(prvA),
    `http://localhost:${portA}`
  );
  const userB = new User(
    "userB",
    privateKeyToAccount(prvB),
    `http://localhost:${portB}`
  );
  const userC = new User(
    "userC",
    privateKeyToAccount(prvC),
    `http://localhost:${portC}`
  );

  // Save users and operator information to user list to all users
  const writeUsers = [
    dbOp.writeUser(operator),
    dbOp.writeUser(userA),
    dbOp.writeUser(userB),
    dbOp.writeUser(userC),

    dbA.writeUser(operator),
    dbA.writeUser(userA),
    dbA.writeUser(userB),
    dbA.writeUser(userC),

    dbB.writeUser(operator),
    dbB.writeUser(userA),
    dbB.writeUser(userB),
    dbB.writeUser(userC),

    dbC.writeUser(operator),
    dbC.writeUser(userA),
    dbC.writeUser(userB),
    dbC.writeUser(userC)
  ];
  await Promise.all(writeUsers);

  // Account state making process
  const accountA = new Account(1, 5, "userA");
  const accountB = new Account(1, 10, "userB");
  const accountC = new Account(1, 15, "userC");

  const stateA = new StateObject(privateKeyToAccount(prvA), accountA, dbA);
  const stateB = new StateObject(privateKeyToAccount(prvB), accountB, dbB);
  const stateC = new StateObject(privateKeyToAccount(prvC), accountC, dbC);

  // Operator keeps all states, others keep their own state only
  const writeStates = [
    dbOp.writeState(stateA),
    dbOp.writeState(stateB),
    dbOp.writeState(stateC),
    dbA.writeState(stateA),
    dbB.writeState(stateB),
    dbC.writeState(stateC)
  ];
  await Promise.all(writeStates);

  // Make genesis block
  let data = {
    previousHash: "",
    potentialHashList: [],
    accountState: {
      nonce: accountA.nonce,
      balance: accountA.balance
    },
    merkleHash: "",
    difficulty: 0,
    timestamp: Date.now(),
    nonce: 0
  };

  const headerA = new Header(data);
  data.accountState = {
    nonce: accountB.nonce,
    balance: accountB.balance
  };
  const headerB = new Header(data);
  data.accountState = {
    nonce: accountC.nonce,
    balance: accountC.balance
  };
  const headerC = new Header(data);

  const blockA = new Block(headerA, []);
  const blockB = new Block(headerB, []);
  const blockC = new Block(headerC, []);

  signBlock(blockA, prvA);
  console.log(stateA.address, blockA.sender);
  signBlock(blockB, prvB);
  console.log(stateB.address, blockB.sender);
  signBlock(blockC, prvC);
  console.log(stateC.address, blockC.sender);

  console.log(blockA.hash, blockB.hash, blockC.hash);
  // Make checkpoint for each genesis block
  const checkpointA = new Checkpoint(stateA.address, blockA.hash, 0);
  const checkpointB = new Checkpoint(stateB.address, blockB.hash, 1);
  const checkpointC = new Checkpoint(stateC.address, blockC.hash, 2);

  signCheckpoint(checkpointA, prvOp);
  signCheckpoint(checkpointB, prvOp);
  signCheckpoint(checkpointC, prvOp);
  console.log(checkpointA.validate(privateKeyToAccount(prvOp)));
  console.log(checkpointB.validate(privateKeyToAccount(prvOp)));
  console.log(checkpointC.validate(privateKeyToAccount(prvOp)));

  // Save block and checkpoint to operator and users' database
  const writeBlocks = [
    dbOp.writeBlock(blockA),
    dbOp.writeBlock(blockB),
    dbOp.writeBlock(blockC),
    dbA.writeBlock(blockA),
    dbB.writeBlock(blockB),
    dbC.writeBlock(blockC)
  ];
  await Promise.all(writeBlocks);

  const writeCheckpoints = [
    dbOp.writeCheckpoint(checkpointA),
    dbOp.writeCheckpoint(checkpointB),
    dbOp.writeCheckpoint(checkpointC),
    dbA.writeCheckpoint(checkpointA),
    dbB.writeCheckpoint(checkpointB),
    dbC.writeCheckpoint(checkpointC)
  ];
  await Promise.all(writeCheckpoints);
  process.exit(1);
}

main();
