"use strict";

const { Account } = require("./account.js");

class StateObject {
  /**
   * @constructor
   * @param {*} address
   * @param {*} account
   * @param {*} db
   */
  constructor(address, account, db) {
    this.address = address;
    this.account = account;
    this.db = db;
  }

  isEmpty() {
    return this.account ? this.account.isEmpty() : undefined;
  }

  getAddress() {
    return this.address;
  }

  getNonce() {
    return this.account ? this.account.getNonce() : undefined;
  }

  setNonce(nonce) {
    return this.account ? this.account.setNonce(nonce) : undefined;
  }

  increaseNonce() {
    return this.account ? this.account.increaseNonce() : undefined;
  }

  getBalance() {
    return this.account ? this.account.getBalance() : undefined;
  }

  addBalance(amount) {
    return this.account ? this.account.addBalance(amount) : undefined;
  }

  subBalance(amount) {
    return this.account ? this.account.subBalance(amount) : undefined;
  }

  setBalance(amount) {
    return this.account ? this.account.setBalance(amount) : undefined;
  }
}

const setStateObject = async function(state, address, account) {
  if(!state) state = new StateObject(address, account);
  else {
    state.address = address;
    state.account = account;
  }
  return await state.db.writeState(state);
}

getStateObject = async function(db, addr) {
  return await db.readState(addr);
}

module.exports = {
  StateObject,
  setStateObject,
  getStateObject
};
