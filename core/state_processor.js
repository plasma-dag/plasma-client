/**
 * 트랜잭션이 처리됨에 따라 바뀌는 스테이트를 처리하는 로직이 여기 담긴다.
 * 스테이트를 처리하는 방법은 내가 갖고 있는 체인에 적용가능한 tx인지를 확인하고,
 * 한 단계 씩 순서대로 진행하면서 스테이트를 바꾸면 된다.
 */

const { Transaction } = require("./transaction.js");
const { StateObject } = require("./stateObject.js");

const SEND = 0;
const RECEIVE = 1;

function userStateTransition(stateObject, transaction) {
    // check validity of signature 
    if(!isValidTransaction(transaction)) {
        alert("unvalid transaction.")
        return null;
    }
    
    if(transaction.accountNonce <= stateObject.getNonce()) {
        alert("transaction nonce is already used.")
        return null;
    }    

    if(transaction.type == SEND) {
        sendStateTransition(stateObject, transcation);
    }
    else if(transaction.type == RECEIVE) {
        receiveStateTransition(stateObject, transaction);
    } 
    else {
        alert("undefined transaction type.")
        return null;
    }
}

function sendStateTransition(stateObject, transaction) {
    if(transaction.sender != stateObject.account) {
        alert("diffrent stateObject-transaction account.")
        return null;
    }

    if(stateObject.getBalance() < transaction.value) {
        alert("balance shortage.")
        return null;
    }

    stateObject.subBalance(transaction.value);    
    stateObject.setNonce(stateObject.getNonce()++);
}

function receiveStateTransition(stateObject, transaction) {
    if(transaction.receiver != stateObject.account) {
        alert("diffrent stateObject-transaction account.")
        return null;
    }

    stateObject.addBalance(transaction.value);
    stateObject.setNonce(stateObject.getNonce()++);
}

/**
 * 
 * TODO: state transition과 operator의 승인에 대한 처리
 */


module.exports = {
    userStateTransition

}