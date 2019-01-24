'use strict';

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
    
    isEmpty() {
        return this.account ? this.account.isEmpty() : undefined;
    }

    setState(address, nonce, balance) {
        if(this.account === undefined) { 
            return undefined;
        }
        this.address = address;
        this.account.nonce = nonce;
        this.account.balance = balance;
    }
    
    getState() {
        if(this.account === undefined) { 
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
        return this.account ? this.account.setBalance(amount) : undefined;
    }
    
    setBalance(amount) {
        return this.account ? this.account.setBalance(amount) : undefined;
    }
}

module.exports = { 
    StateObject,
};
