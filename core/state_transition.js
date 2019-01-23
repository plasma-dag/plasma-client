'use strict';

const { Transaction } = require('./transaction');
const { StateObject } = require('./stateObject');

// block에 sender, receiver둘다 있기 때문에 operator와 사용자의 state transition이 달라짐



const applyStateTransition = (stateObject, transaction) => {
    if(transaction.sender == stateObject.address && transaction.accountNonce < stateObject.getNonce()) {
        console.log(`transaction nonce is already used.`);
        return false;
    }    
    
    if(stateObject.address === transaction.sender) {        
        if(stateObject.getBalance() < transaction.value) {
            console.log(`balance shortage.`);
            return false;
        }
        stateObject.subBalance(transaction.value);    
        stateObject.setNonce(stateObject.getNonce()+1);        
        return true;
    }
    else if(stateObject.address === transaction.recipient) {    
        stateObject.addBalance(transaction.value);
        return true;
    }
    else return false;
}

// function applyStateTransition(stateObject, transaction) {    
//     if(transaction.sender == stateObject.address && transaction.accountNonce < stateObject.getNonce()) {
//         console.log(`transaction nonce is already used.`)
//         return false;
//     }    
//     //if(transaction.type == SEND_TRANSACTION) {
//     const result = stateObject.address === transaction.sender ? sendStateTransition(stateObject, transaction) : 
//                    stateObject.address === transaction.recipient ? receiveStateTransition(stateObject, transaction) : 
//                    false;
//     return result;
//     /*
//     if(stateObject.address === transaction.sender) {
//         return sendStateTransition(stateObject, transaction);
//     }
//     //else if(transaction.type == RECEIVE_TRANSACTION) {
//     else if(stateObject.address === transaction.receiver) {
//         return receiveStateTransition(stateObject, transaction);
//     }
//     else {
//         return false;
//     }
//     */
// }

// function sendStateTransition(stateObject, transaction) {    
//     /*
//     if(transaction.sender != stateObject.address) {
//         console.log("diffrent stateObject-transaction address.");
//         return false;
//     } 
//     */   
//     if(stateObject.getBalance() < transaction.value) {
//         console.log(`balance shortage.`);
//         return false;
//     }

//     stateObject.subBalance(transaction.value);    
//     stateObject.setNonce(stateObject.getNonce()+1);
//     return true;
// }

// function receiveStateTransition(stateObject, transaction) {
//     /*
//     if(transaction.receiver != stateObject.address) {
//         console.log("diffrent stateObject-transaction address.")
//         return false;
//     }
//     */
//     stateObject.addBalance(transaction.value);
//     return true;
// }

module.exports = {
    applyStateTransition
}