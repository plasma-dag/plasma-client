/**
 * 
 */


class account {
    /**
     * @constructor
     * @param {*} nonce 
     * @param {*} balance
     * @param {*} storageRoot
     */
    constructor(nonce, balance, storageRoot) {
        this.nonce = nonce;
        this.balance = balance;
        this.storageRoot = storageRoot;        
    }
    
    getNonce() {
    	return this.Nonce;
    }
    
    getBalance() {
    	return this.Balance;
    }
    
    getStorageRoot() {
    	return this.getStorageRoot;
    }   
}


function increaseNonce(account) {
	account.nonce++;
}

function addBalance(account, amount) {
	account.balance += amount;
}

function subBalance(account, amount) {
	if(account.balance < amount) {
		alert("balance is smaller than amount.")
		return;
	}
	account.balance -= amount;
}

function calculateStorageRoot(account, storage) {
	
	
}