/**
 * 트랜잭션이 처리됨에 따라 바뀌는 스테이트를 처리하는 로직이 여기 담긴다.
 * 스테이트를 처리하는 방법은 내가 갖고 있는 체인에 적용가능한 tx인지를 확인하고,
 * 한 단계 씩 순서대로 진행하면서 스테이트를 바꾸면 된다.
 */
"use strict";

const { stateDB } = require("./stateDB");
const { StateObject } = require("./stateObject");
const { Block } = require("./block");
const { applyStateTransition } = require("./state_transition");

// for validated block
function operatorProcess(blockchain, stateDB, block, blockOwnerAddr) {
    return process(stateDB.stateObjects[blockOwnerAddr], block);
}

// for validated block
 function process(stateObject, block) {    
    let copyOfStateObject = stateObject.deepCopy();
    let { address, nonce, balance } = copyOfStateObject;
    let receipts = [];

    for(let key in block.transactions) {    
        let transaction = block.transactions[key];
        let receipt = applyTransaction(stateObject, transaction);
        if(receipt == undefined || receipt == false) {
            stateObject.setState(stateObject, address, nonce, balance);
            console.log("receipt is undefined.");
            return undefined;
        }
        receipts.push(receipt);
    }

    return receipts;
}


 
 function applyTransaction(stateObject, transaction) {
    if(!applyStateTransition(stateObject, transaction)) {
        return false;
    }
    /**
     * potential 참고
     */
    /**
     * TODO : process receipt.
     */ 

    let receipt;

    return receipt;
 }



 module.exports = {
     operatorProcess,
     process
 }