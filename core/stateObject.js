/**
 * 
 */

class StateObject {
    /**
     * @constructor
     * @param {*} address
     * @param {*} account
     * @param {*} db?
     * @param {*} trie?
     */
    constructor(address, account) {
        this.address = address;
        this.account = account;
    }
    
    getNonce(nonce) {
    	if(this.account == null)
    		return null;
    	return this.account.getNonce(nonce);
    }
    
    setNonce(nonce) {
    	if(this.account == null)
    		return null;
    	return this.account.setNonce(nonce);
    }
    
    getBalance() {
    	return this.account.getBalance();
    }
    
    addBalance(amount) {
    	if(this.account == null)
    		return null;
    	return this.account.addBalance(amount);
    }
    
    subBalance(amount) {
    	if(this.account == null)
    		return null;
    	return this.account.subBalance(amount);
	}
    
    

    setState(db, key) {
    	
    }
    
    getState(db, key) {
    	
    }

    /**
     * Example method
     */
    hello() {
        return 'hello';
    }
}






