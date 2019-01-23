'use-strict';
const ut = require('../common/utils');

/**
 * Transaction
 */
class Transaction {
    /**
     * @constructor
     * 
     * @param {number} accountNonce 
     * @param {address} receiver
     * @param {address} sender 
     * @param {number} value 
     */
    constructor(accountNonce, receiver, sender, value) {
        if (!(accountNonce || receiver || sender || value)) {
            return Error('Not enough parameters');
        }
        this.data = {
            accountNonce,
            receiver,
            sender,
            value,
        }
    }
    /**
     * Returns and saves hash value of tx data, exclude signature information
     */
    hash() {
        if (this.txHash) return this.txHash
        // cache hash value
        this.txHash = ut.calculateHash(this.data).toString();
        return this.txHash;
    }


    /**
     * 
     * @param {*} txHash 
     */
    getTxDatabyhash(txHash) {
        
    }
}


function rlpEncode(tx) {
    return rlp.encode(tx.data);
}
/** 
 * TODO: this part is for cli, not about transaction itself. Should be moved to other files.
 */

/*
function sendTransaction(nonce, receiver, sender, value) {
	let Transaction = new Transaction(nonce, receiver, sender, value);
	//transfer(Transaction, );
}

function receiveTransaction(sender, receiver, value) {
	let Transaction = new Transaction(nonce, receiver, sender, value);
	//trasfer(Transaction, )
}

function addTransaction(account, newTransaction) {
	if(isValidTransaction(newTransaction)) {
		Transaction.push(newTransaction);
		return true;
	} 
	return false;
}
*/


module.exports = {
    Transaction
}
