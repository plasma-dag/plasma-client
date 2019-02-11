"use strict";

class StateObject {
  /**
   * @constructor
   * @param {*} address
   * @param {*} account
   */
  constructor(address, account) {
    this.address = address;
    this.account = account;
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

module.exports = {
  StateObject
};
