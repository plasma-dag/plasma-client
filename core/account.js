/**
 * 
 */


class Account {
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
    
    empty() {
        return this.nonce == 0 && this.balance == 0 && storageRoot == 0;
    }

    getNonce() {
    	return this.nonce;
    }
    
    setBalance(amount) {
        this.balance = amount;
    }
    getBalance() {
    	return this.balance;
    }
    
    getStorageRoot() {
    	return this.storageRoot;
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