/**
 * 
 */


class Transaction {
    /**
     * @constructor
     * @param {*} type 
     * @param {*} nonce 
     * @param {*} recipient[] 
     * @param {*} value 
     * @param {*} transactionSignature  
     * @param {*} timestamp 
     */
    constructor(type, nonce, recipient, value, transactionSignature, timestamp) {
        this.type = type;
        this.nonce = nonce;
        this.recipient = recipient;
        this.value = value;
        this.transcationSignature = transactionSignature;
        this.timestamp = timestamp;
    }

    /**
     * Example method
     */
    hello() {
        return 'hello';
    }
}



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


