"use strict";

/**
 * Task class for worker save current work information
 */
class Task {
  constructor(state, block, txsCache = [], fee = 0, totalAmount = 0) {
    this.state = state;
    this.block = block;
    this.txsCache = txsCache;
    this.fee = fee;
    this.totalAmount = totalAmount;
    //this.createAt = time();
  }
  get block() {
    return this.block;
  }
}

/**
 *  Environment is the worker's current environment and holds all of
 *  the current state information.
 */

class Environment {
  constructor(
    stateDB,
    potentialDB,
    lastCheckpoint,
    previousHash,
    transactions
  ) {
    this.stateDB = stateDB; // apply state changes here
    this.potentialDB = potentialDB;
    this.lastCheckpoint = lastCheckpoint;
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.defaultFee = defaultFee();
    this.valueLimit = valueLimit();
    this.txCount = 0;
  }
}

/**
 * Worker is set environment to commit new block work
 *
 * @param {Address} address
 */
class Worker {
  constructor(bc) {
    this.bc = bc;
    this.newTxs = [];
  }
}

module.exports = {
  Task,
  Environment,
  Worker
};
