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
    
    return true;
}

const sendStateTransition = (stateObject, transaction) => {
    // check nonce
    if(!preCheck(stateObject, transaction)) {
        return false;
    }
    // // check balance
    // if(stateObject.getBalance() < transaction.value) {
    //     console.log(`balance shortage.`);
    //     return false;
    // }

    stateObject.setNonce(stateObject.getNonce()+1);        
    stateObject.subBalance(transaction.value);    

    return true;
}
const receiveStateTransition = (stateObject, transaction) => {
    stateObject.addBalance(transaction.value);
    return true;
}

module.exports = {
    applyStateTransition
}