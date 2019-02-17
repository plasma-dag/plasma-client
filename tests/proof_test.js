"use-strict";
const { Proof } = require("../src/core/proof");
const { Header } = require("../src/core/block");
const { Database } = require("../src/db/index");
const { Account } = require("../src/core/account");
const { Transaction } = require("../src/core/transaction");

async function wait(promise, prefix) {
  let r = await promise;
  console.log(r);
  return;
}

const blockHeader1 = new Header("1st", [], new Account(1, 65, 0), "a", 0, 0, 0);
const blockHeader2 = new Header("2nd", [], new Account(1, 65, 0), "b", 0, 0, 0);
const Proof1 = new Proof(
  new Transaction("receiver1", 10),
  null,
  null,
  null,
  "1",
  blockHeader1
);
const Proof2 = new Proof(
  new Transaction("receiver2", 25),
  null,
  null,
  null,
  "2",
  blockHeader2
);

const db = new Database();

// wait(db.writeProof([Proof1, Proof2]));
wait(db.readProof(1, "receiver1"));

// console.log([Proof1, Proof2].filter(proof => proof.proof.tx.data.receiver == "receiver1"))
