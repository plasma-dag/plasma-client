"use strict";

const { Transaction } = require("./transaction.js");
const { StateObject } = require("./stateObject.js");

function applyStateTransition(stateObject, transaction) {
  if (transaction.accountNonce <= stateObject.getNonce()) {
    console.log("transaction nonce is already used.");
    return false;
  }
  //if(transaction.type == SEND_TRANSACTION) {
  if (stateObject.address == transaction.sender) {
    return sendStateTransition(stateObject, transcation);
  }
  //else if(transaction.type == RECEIVE_TRANSACTION) {
  else if (stateObject.address == transaction.receiver) {
    return receiveStateTransition(stateObject, transaction);
  } else {
    return false;
  }
}

function sendStateTransition(stateObject, transaction) {
  /*
    if(transaction.sender != stateObject.address) {
        console.log("diffrent stateObject-transaction address.");
        return false;
    } 
    */

  if (stateObject.getBalance() < transaction.value) {
    console.log("balance shortage.");
    return false;
  }

  stateObject.subBalance(transaction.value);
  stateObject.setNonce(stateObject.getNonce() + 1);
  return true;
}

function receiveStateTransition(stateObject, transaction) {
  /*
    if(transaction.receiver != stateObject.address) {
        console.log("diffrent stateObject-transaction address.")
        return false;
    }
    */

  stateObject.addBalance(transaction.value);
  return true;
}

module.exports = {
  applyStateTransition
};
