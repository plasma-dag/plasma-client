'use strict';

const { Transaction } = require('./transaction');
const { StateObject } = require('./stateObject');

// block에 sender, receiver둘다 있기 때문에 operator와 사용자의 state transition이 달라짐

const preCheck = (stateObject, transaction) => {
    const nonce = stateObject.getNonce();
    if(nonce < transaction.accountNonce) {
        return Error('nonce high');
    }
    else if(nonce > transaction.accountNonce) {
        return Error('nonce low');
    }    
}

const sendStateTransition = (stateObject, transaction) => {
    // check nonce
    if(!preCheck(stateObject, transaction)) {
        return Error('nonce error');
    }

    stateObject.setNonce(stateObject.getNonce()+1);        
    stateObject.subBalance(transaction.value);    

}
const receiveStateTransition = (stateObject, transaction) => {
    stateObject.addBalance(transaction.value);
}

module.exports = {
    sendStateTransition,
    receiveStateTransition
}