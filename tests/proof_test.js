"use-strict";
const { Proof } = require("../src/core/proof");
const { Header } = require("../src/core/block");
const { Database } = require("../src/db/index");
const { Account } = require("../src/core/account");
async function wait(promise, prefix) {
  let r = await promise;
  console.log(prefix);
  console.log(r);
  return;
}

const blockHeader1 = new Header("a", [], new Account(0, 0, 0), "b", 0, 0, 0);
const Proof1 = new Proof(null, null, null, null, null, blockHeader1);

const db = new Database();

wait(db.writeProof([Proof1]));
