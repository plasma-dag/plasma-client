"use strict";

const { Account } = require("./account");

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

  setState(address, nonce, balance) {
    if (this.account === undefined) {
      return undefined;
    }
    this.address = address;
    this.account.nonce = nonce;
    this.account.balance = balance;
  }

  getState() {
    if (this.account === undefined) {
      return undefined;
    }
    return {
      nonce: this.account.nonce,
      balance: this.account.balance
    };
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

class StateDB {
  /**
   * @constructor
   *
   * @param {*} db
   */

  constructor(db) {
    // this.trie = db.openTree();
    this.db = db;
    this.stateObjects = {};
  }

  async populate() {
    const allStates = await this.db.readAllStates();
    for (p in allStates) {
      this.stateObjects[p.address] = new StateObject(
        p.address,
        p.account,
        this.db
      );
    }
  }

  async isExist(addr) {
    return Boolean(await this.getStateObject(addr));
  }

  async getStateObject(addr) {
    if (this.stateObjects[addr]) return this.stateObjects[addr];
    const stateObj = await this.db.readState(addr);
    if (stateObj) this.stateObjects[addr] = stateObj;
    return stateObj;
  }

  async setState(addr, account) {
    let newState = new StateObject(addr, account);
    this.stateObjects[addr] = newState;
    return await this.db.writeState(newState);
  }

  makeNewState(addr) {
    const newAccount = new Account(0, 0, "");
    const state = new StateObject(addr, newAccount);
    this.setState(addr, newAccount);
    return state;
  }
  /* 
	updateStateObject(stateObject) {
		let addr = stateObject.address;
		// let data = rlp.encodeToByte(stateObject);
		this.trie.tryUpdate(addr, data);
	}
*/
  // deleteStateObject(stateObject) {
  // 	stateObject.deleted = true;
  //    	this.trie.tryDelete(stateObject.address);
  // }
  getNonce(addr) {
    let stateObject = this.getStateObject(addr);
    if (stateObject) {
      return stateObject.getNonce();
    }
    return null;
  }

  setNonce(addr, nonce) {
    let stateObject = this.getStateObject(addr);
    if (stateObject) {
      return stateObject.setNonce(nonce);
    }
    return Error("state object doesn't exist");
  }

  getBalance(addr) {
    let stateObject = this.getStateObject(addr);
    if (stateObject) {
      return stateObject.getBalance();
    }
    return Error("state object doesn't exist");
  }

  addBalance(addr, amount) {
    let stateObject = this.getStateObject(addr);
    if (stateObject) {
      return stateObject.addBalance(amount);
    }
    return Error("state object doesn't exist");
  }

  subBalance(addr, amount) {
    let stateObject = this.getStateObject(addr);
    if (stateObject) {
      return stateObject.subBalance(amount);
    }
    return Error("state object doesn't exist");
  }

  getStorageRoot(addr) {
    let stateObject = this.getStateObject(addr);
    if (stateObject) {
      return stateObject.getStorageRoot();
    }
    return Error("state object doesn't exist");
  }
}

module.exports = {
  StateObject,
  StateDB
};
