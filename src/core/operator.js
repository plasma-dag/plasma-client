"use-strict";

const Blockchain = require("./blockchain");
const BlockValidator = require("./validator");
const worker = require("../miner.js");

class Operator {
  /**
   *
   * @param {*} db
   * @param {*} stateDB
   * @param {*} potentialDB
   * @param {*} state
   */
  constructor(db, stateDB, potentialDB, state) {
    this.db = db;
    this.stateDB = stateDB;
    this.potentialDB = potentialDB;
    this.state = state;
    this.bc = new Blockchain(db, state.address);
    this.blockValidator = new BlockValidator(db, bc, potentialDB);
    //this.worker = new Worker();
    this.submittedBlock = [];
  }

  // deposit phase 1
  deposit(value, contractBlock) {
    const result = this.blockValidator.validateContractBlock(contractBlock); // TODO
    if (result.error) return result;
    this.potentialDB.sendPotential(value, contractBlock.state.address);
    return { error: false };
  }

  /**
   *
   * @param {*} block
   * @param {*} prvKey
   */
  processBlock(block, prvKey) {
    let result = this.blockValidator.validateBlock(block); // TODO: have to cover validating deposit block(deposit block has no tx)
    if (result.error) return result;
    // block process
    const opSigCheckpoint = operatorStateProcess(
      this.db,
      this.stateDB,
      this.potentialDB,
      this.bc,
      block,
      prvKey,
      this.state.getNonce()
    );

    return { error: false };
  }
}

module.exports = {
  Operator
};
