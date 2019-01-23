"use strict";

const { StateObject } = require("./stateObject.js");

class StateDB {
    /**
     * @constructor
     *
     * @param {*} db
     * @param {*} trie
     * @param {*} stateObjects
     */

    constructor(db) {
        // this.trie = db.openTree();
        this.db = db;
        this.stateObjects = [];
    }

    isExist(addr) {
        return Boolean(this.getStateObject(addr));
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
    StateDB
};
