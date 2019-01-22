'use-strict';
const { Transaction } = require('../core/transaction');
const { Database } = require('./database');

let newTx = new Transaction(
    'send',
    0,
    null,
    null,
    1,
    '123123'
);

const db = new Database();

db.writeTx(newTx)
.then(res => console.log(res))
.catch(err => console.log(err));

db.readTx(newTx.hash())
.then(res => console.log(res))
.catch(err => console.log(err));
