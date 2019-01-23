/**
 * Represent Account structure
 */
'use-strict'

class Account {
    /**
     * @constructor
     * @param {Number} nonce 
     * @param {Number} balance
     * @param {Hash} storageRoot
     */
    constructor(nonce, balance, storageRoot) {
        this.nonce = nonce;
        this.balance = balance;
        this.storageRoot = storageRoot;
    }
    
    isEmpty() {
        return this.nonce == 0 && this.balance == 0 && storageRoot == '';
    }

    getNonce() {
    	return this.nonce;
    }
    setNonce(nonce) {
        this.nonce = nonce;
    }
    
    setBalance(amount) {
        this.balance = amount;
    }

    addBalance(amount) {
        this.balance += amount;
    }

    subBalance(amount) {
        this.balance -= amount;
    }

    getBalance() {
    	return this.balance;
    }
    
    getStorageRoot() {
    	return this.storageRoot;
    }


    increaseNonce() {
        this.nonce++;
    }

    addBalance(amount) {
        // TODO: balance overflow checking algorithm
        this.balance += amount;
    }
}


/*
function addBalance(account, amount) {
	account.balance += amount;
}
>>>>>>> Stashed changes

    subBalance(amount) {
        if(this.balance < amount) {
            return Error('Not enough balance');
        }
        this.balance -= amount;
    }

    calculateStorageRoot(storage) {}
}
*/

module.exports = {
    Account
}
