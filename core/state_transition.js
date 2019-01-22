"use strict";

const { Transaction } = require("./transaction.js");
const { StateObject } = require("./stateObject.js");


function applyStateTransition(stateObject, transaction) {    
    if(transaction.accountNonce <= stateObject.getNonce()) {
        alert("transaction nonce is already used.")
        return false;
    }    
    if(transaction.type == SEND_TRANSACTION) {
        return sendStateTransition(stateObject, transcation);
    }
    else if(transaction.type == RECEIVE_TRANSACTION) {
        return receiveStateTransition(stateObject, transaction);
    }
}

function sendStateTransition(stateObject, transaction) {    
    if(transaction.sender != stateObject.address) {
        alert("diffrent stateObject-transaction address.");
        return false;
    }    
    if(stateObject.getBalance() < transaction.value) {
        alert("balance shortage.")
        return false;
    }
    stateObject.subBalance(transaction.value);    
    stateObject.setNonce(stateObject.getNonce()++);
    return true;
}

function receiveStateTransition(stateObject, transaction) {
    if(transaction.receiver != stateObject.address) {
        alert("diffrent stateObject-transaction address.")
        return false;
    }
    stateObject.addBalance(transaction.value);
    return true;
}

module.exports = {
    applyStateTransition
}