'use-strict';
const ut = require('../common/utils');

/**
 * Transaction
 */
class Transaction {
    /**
     * @constructor
     * 
     * @param {number}  accountNonce 
     * @param {address} receiver
     * @param {number}  value
     */
    constructor(accountNonce, receiver, value) {
        if (!(accountNonce || receiver || value)) {
            return Error('Not enough parameters');
        }
        this.data = {
            accountNonce,
            receiver,
            value,
            // data,
        }
    }
    /**
     * Returns and saves hash value of tx data, exclude signature information
     */
    hash() {
        if (this.txHash) return this.txHash
        // cache hash value
        const { accountNonce, receiver, value } = this.data;
        this.txHash = ut.calculateHash(
            {
                accountNonce,
                receiver,
                value,
                // data,
            }).toString();
        return this.txHash;
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
