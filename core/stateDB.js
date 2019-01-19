/**
 * 
 */

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
    	var stateObject = this.stateObjects.addr;
    	if(stateObject != undefined) {
    		if(stateObject.deleted) {
    			return undefined;
    		}
    		return stateObject;
    	}
    	return undefined;
    }

    setStateObject(stateObject) {
    	this.stateObjects.addr = stateObject;
    }

    createStateObject(addr) {
    	var account = new account(0, 0, 0); 
    	var stateObject = new StateObject(addr, account);
    	return this.setStateObject(stateObject);
    }
/* 
    updateStateObject(stateObject) {
    	var addr = stateObject.address;
    	// var data = rlp.encodeToByte(stateObject);
    	this.trie.tryUpdate(addr, data);
    }
*/
    deleteStateObject(stateObject) {
    	stateObject.deleted = true;
//    	this.trie.tryDelete(stateObject.address);
    }

    getNonce(addr, nonce) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) {
    		alert("stateObject doen't exist");
    	}
    	stateObject.getNonce(nonce);    	
    }

    setNonce(addr, nonce) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == null) {
    		alert("stateObject doen't exist");
    	}
    	stateObject.setNonce(nonce);    	
    }    

    getBalance(addr) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) 
    		return undefined;
    	return stateObject.getBalance(amount);    	
    }    

    addBalance(addr, amount) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) {
    		alert("stateObject doen't exist");
    	}
    	stateObject.addBalance(amount);
    }

    subBalance(addr, amount) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) {
    		alert("stateObject doen't exist");
    	}
    	stateObject.subBalance(amount);
    }

    getStorageRoot(addr) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == undefined) {
    		alert("stateObject doen't exist");
    	}
    	stateObject.getStorageRoot();    	
	}
	
	
}





