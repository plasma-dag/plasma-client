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
	
    constructor(db, trie, stateObjects) {
        this.trie = db.openTree();
        this.stateObjects = {};
    }

    getStateObject(addr) {
    	var stateObject = this.stateObjects.addr;
    	if(stateObject != null) {
    		if(stateObject.deleted) {
    			return null;
    		}
    		return stateObject;
    	}
    	return null;
    }

    setStateObject(stateObject) {
    	this.stateObjects.addr = stateObject;
    }

    createObject(addr) {
    	var account = new account(0, 0, 0); 
    	var stateObject = new StateObject(addr, account);
    	return this.setStateObject(stateObject);
    }

    updateStateObject(stateObject) {
    	var addr = stateObject.address;
    	// var data = rlp.encodeToByte(stateObject);
    	this.trie.tryUpdate(addr, data);
    }

    deleteStateObject(stateObject) {
    	stateObject.deleted = true;
    	this.trie.tryDelete(stateObject.address);
    }

    getNonce(addr, nonce) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == null) {
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
    	if(stateObject == null) 
    		return null;
    	return stateObject.getBalance(amount);    	
    }    

    addBalance(addr, amount) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == null) {
    		alert("stateObject doen't exist");
    	}
    	stateObject.addBalance(amount);
    }

    subBalance(addr, amount) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == null) {
    		alert("stateObject doen't exist");
    	}
    	stateObject.subBalance(amount);
    }

    getStorageRoot(addr) {
    	var stateObject = this.getStateObject(addr);
    	if(stateObject == null) {
    		alert("stateObject doen't exist");
    	}
    	stateObject.getStorageRoot();    	
    }
}





