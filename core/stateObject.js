"use strict";

const { Account } = require("./account.js");

class StateObject {
    /**
     * @constructor
     * @param {*} address
     * @param {*} account
     * @param {*} db
     * @param {*} trie
     */
    constructor(address, account, db) {
        this.address = address;
        this.account = account;
        this.db = db;
    }

    deepCopy() {
        return {
            address: this.address, 
            nonce: this.account.nonce, 
            balance: this.account.balance
        };
    }
    
    empty() {
        if(this.account == undefined) {
            return undefined;
        }
        return this.account.empty();
    }

    setState(address, nonce, balance) {
        if(this.account == undefined) { 
            return undefined;
        }
        this.address = address;
        this.account.nonce = nonce;
        this.account.balance = balance;
    }

    getAddress() {
        return this.address;
    }

    getNonce() {
    	if(this.account == undefined)
    		return undefined;
    	return this.account.getNonce();
    }
    
    setNonce(nonce) {
    	if(this.account == undefined) {
            return undefined;
        }
    	return this.account.setNonce(nonce);
    }
    
    getBalance() {
        if(this.account == undefined) {
            return undefined;
        }
    	return this.account.getBalance();
    }
    
    addBalance(amount) {
    	if(this.account == undefined) {
            return undefined;
        }
    	return this.account.addBalance(amount);
    }
    
    subBalance(amount) {
    	if(this.account == undefined) {
            return undefined;
        }
    	return this.account.subBalance(amount);
    }
    
    setBalance(amount) {
        if(this.account == undefined) {
            return undefined;
        }
        this.account.setBalance(amount);
    }
    
    /* account storage
    setStateObject(db, key, value) {
        prevValue = this.getStateObject(db, key);
        if(prevValue == value) {
            return;
        }
        db.append(key, value);
    }
    
    getStateObject(db, key) {
        return db.openStateObject(db, key); 
    }
    */

}

module.exports = {
   StateObject
  }





