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

module.exports = { 
    Account,
};