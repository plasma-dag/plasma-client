'use-strict';
const { Block, Header } = require('../core/block');
const { Transaction } = require('../core/transaction');
const { StateObject } = require('../core/stateObject');
const { Account } = require('../core/account');
const { Checkpoint } = require('../core/checkpoint');
const { Database } = require('./database');

async function wait(promise, prefix) {
  let r = await promise;
  console.log(prefix);
  console.log(r);
  return;
}

let newAccount = new Account(
  11111,
  13414,
  ''
);
let newTransaction = new Transaction(
1,
newAccount,
500000
);
let newHeader = new Header(
    'dddddddddd',
    '',
    newTransaction.hash(),
    0,
    12,
    12314124,
    152,
    ''
);
let newBlock = new Block(
  newHeader, 
  'signature', 
  [ newTransaction ]
);
let newState = new StateObject(
    'addresstest',
    newAccount
);
let newCheckpoint = new Checkpoint(
  newBlock.hash(),
  1,
  'operator signature'
);

const db = new Database();

wait(db.writeTx(newTransaction), 'write Tx: ');
wait(db.readTx(newTransaction.hash()), 'read Tx: ');

wait(db.writeBlock(newBlock), 'write block: ');
wait(db.readBlock(newBlock.hash()), 'read block: ');

wait(db.writeState(newState), 'write state: ');
wait(db.readState(newState.getAddress()), 'read state: ');

wait(db.writePotential(newState.address,[ newBlock.hash() ]), 'write potential: ');
wait(db.readAllPotentials(), 'read potential: ');

wait(db.writeCheckpoint(newCheckpoint), 'write checkpoint: ');
wait(db.readCheckpointWithBlockHash(newBlock.hash()), 'read checkpoint: ');
