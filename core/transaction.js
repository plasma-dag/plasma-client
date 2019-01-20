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
     * @param {string} transactionSignature 
     */
    constructor(type, accountNonce, recipient, sender, value, transactionSignature) {
        if (!(type || accountNonce || recipient || sender || value || transactionSignature)) {
            return Error('Not enough parameters');
        }
        this.data = {
            type,
            accountNonce,
            recipient,
            sender,
            value,
        }
        this.transcationSignature = transactionSignature;
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
}

function rlpEncode(tx) {
    return rlp.encode(tx.data);
}
/** 
 * TODO: this part is for cli, not about transaction itself. Should be moved to other files.
 */
const operatorAddr = 21321412; 

function sendTransaction(sender, signature, receiver, value) {
	if(sender.balance < value)
		return;
	var addr = [operatorAddr, reciever.key];
	var Transaction = new Transaction(0, sender.nonce, addr, value, signature, Math.round(new Date().getTime() / 1000));
	//transfer(Transaction, );
}

function receiveTransaction(sender, signature, receiver, value) {
	var addr = [operatorAddr];
	var Transaction = new Transaction(1, sender.nonce, addr, value, signature, Math.round(new Date().getTime() / 1000));
	//trasfer(Transaction, )
}

function addTransaction(account, newTransaction) {
	if(isValidTransaction(newTransaction)) {
		Transaction.push(newTransaction);
		return true;
	} 
	return false;
}

function isValidTransaction(newTransaction) {
	
	
	
}

module.exports = {
    Transaction
}
