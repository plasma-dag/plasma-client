'use-strict';
const ut = require('../common/utils');

/**
 * Transaction
 */
class Transaction {
    /**
     * @constructor
     * 
     * @param {string} type 'send' or 'receive' 
     * @param {number} accountNonce 
     * @param {address} recipient 
     * @param {address} sender 
     * @param {number} value 
     */
    constructor(type, accountNonce, recipient, sender, value) {
        if (!(type || accountNonce || recipient || sender || value)) {
            return Error('Not enough parameters');
        }
        this.data = {
            type,
            accountNonce,
            recipient,
            sender,
            value,
        }
    }
    /**
     * Returns and saves hash value of tx data, exclude signature information
     */
    hash() {
        if (this.hash) return this.hash
        // cache hash value
        this.hash = ut.calculateHash(this.data).toString();
        return this.hash;
    }
}

function rlpEncode(tx) {
    return rlp.encode(tx.data);
}
/** 
 * TODO: this part is for cli, not about transaction itself. Should be moved to other files.
 */
const operatorAddr = 21321412; 

function sendTransaction(nonce, receiver, sender, value) {
	let Transaction = new Transaction(0, nonce, receiver, sender, value);
	//transfer(Transaction, );
}

function receiveTransaction(sender, receiver, value) {
	let Transaction = new Transaction(1, nonce, receiver, sender, value);
	//trasfer(Transaction, )
}

function addTransaction(account, newTransaction) {
	if(isValidTransaction(newTransaction)) {
		Transaction.push(newTransaction);
		return true;
	} 
	return false;
}



module.exports = {
    Transaction
}
