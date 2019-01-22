"use strict";

const { Account } = require("./account.js");
const { StateObject } = require("./stateObject.js");

class StateDB {
    /**
	 * 
	 * @param {*} db 
	 * @param {*} trie 
	 * @param {*} stateObjects 
	 */	

    constructor(db) {
		//this.trie = db.openTree();
		db = db;
        this.stateObjects = {};
	}
	
	exist(addr) {
		return this.getStateObject(addr);
	}

	empty(addr) {
		stateObject = this.getStateObject(addr);
		return stateObject == undefined || stateObject.empty();		
	}

	setState(addr, key, value) {
		stateObject = this.getStateObject(addr);
		if(stateObject != undefined) {
			stateObject.setState(this.db, key, value);
		} 
		else {
			stateObject = createStateObject(addr);
		}
	}

    getStateObject(addr) {
    	let stateObject = this.stateObjects.addr;
    	if(stateObject != undefined) {
    		if(stateObject.deleted) {
    			return undefined;
    		}
    		return stateObject;
    	}
    	return undefined;
    }

    setStateObject(stateObject) {
    	this.stateObjects[stateObject.address] = stateObject;
    }

    createStateObject(addr) {		
		let account = new Account(0, 0, 0);    	
		let stateObject = new StateObject(addr, account);
		this.setStateObject(stateObject);
		return stateObject;
    }
/* 
    updateStateObject(stateObject) {
    	let addr = stateObject.address;
    	// let data = rlp.encodeToByte(stateObject);
    	this.trie.tryUpdate(addr, data);
    }
*/
    deleteStateObject(stateObject) {
    	delete(stateObjects[stateObject.address]);
//    	this.trie.tryDelete(stateObject.address);
    }

    getNonce(addr, nonce) {
    	let stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) {
    		console.log("stateObject doen't exist");
    	}
    	stateObject.getNonce(nonce);    	
    }

    setNonce(addr, nonce) {
    	let stateObject = this.getStateObject(addr);
    	if(stateObject == null) {
    		console.log("stateObject doen't exist");
    	}
    	stateObject.setNonce(nonce);    	
    }    

    getBalance(addr) {
    	let stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) 
    		return undefined;
    	return stateObject.getBalance(amount);    	
    }    

    addBalance(addr, amount) {
    	let stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) {
    		console.log("stateObject doen't exist");
    	}
    	stateObject.addBalance(amount);
    }

    subBalance(addr, amount) {
    	let stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) {
    		console.log("stateObject doen't exist");
    	}
    	stateObject.subBalance(amount);
    }

    getStorageRoot(addr) {
    	let stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) {
    		console.log("stateObject doen't exist");
    	}
    	stateObject.getStorageRoot();    	
	}	
}

function commitState(db, stateObjects) {
	for(key in stateObjects) {
		let stateObject = stateObjects[key];
		db.writeState(stateObject);
	}
}

module.exports = { 
	StateDB,
};




