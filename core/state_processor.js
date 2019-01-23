/**
 * 트랜잭션이 처리됨에 따라 바뀌는 스테이트를 처리하는 로직이 여기 담긴다.
 * 스테이트를 처리하는 방법은 내가 갖고 있는 체인에 적용가능한 tx인지를 확인하고,
 * 한 단계 씩 순서대로 진행하면서 스테이트를 바꾸면 된다.
 */
'use strict';

const { stateDB } = require('./stateDB');
const { StateObject } = require('./stateObject');
const { Block } = require('./block');
const { applyStateTransition } = require('./state_transition');
const { calculateHash } = require('../common/utils');
//const { Account } = require('./account');

// for validated block
const process = (stateObject, block) => {    
    let copyOfStateObject = stateObject.deepCopy();
    let { address, nonce, balance } = copyOfStateObject;
    console.log(`----------account is {nonce: ${stateObject.getNonce()}, balance: ${stateObject.getBalance()}}.----------------`);

    for(let key in block.transactions) {    
        let transaction = block.transactions[key];                
        if(!applyTransaction(stateObject, transaction)) {
            stateObject.setState(stateObject, address, nonce, balance);            
            return;
        } 
        console.log(`----------transaction is {nonce: ${transaction.accountNonce}, recipient: ${transaction.recipient}, sender: ${transaction.sender}, value: ${transaction.value}}`)
        console.log(`----------account is {nonce: ${stateObject.getNonce()}, balance: ${stateObject.getBalance()}}.----------------`);
    }
}

const applyTransaction = (stateObjcet, transaction) => {
    /**
     * 
     */
    return applyStateTransition(stateObjcet, transaction);            
    
}

const operatorProcess = (stateDB, block) => {
    const address = block.header.data.state.address;
    let stateObject = stateDB.getStateObject(address);
    let potential = stateDB.db.readPotential(address);
    let potentialList = [];
    
    for(let key in block.transactions) {    
        let transaction = block.transactions[key];
        
        // add potential to receiver when send tx
        if(address === transaction.sender) {
            let hash = calculateHash(transactionToString(transaction));            
            let index = potentialList.findIndex( potential => transaction.recipient === potential.address );
            if(index !== -1) {
                potentialList[index].add(transaction, hash);
            }
            else {
                let newPotential = new Potential(transaction, hash);
                potentialList.push(newPotential);
            }
        }
        // remove potential when receive tx
        else if(address === transaction.recipient) {
            let hash = calculateHash(transaction);
            potential.remove(potential.find(hash));
        }

        if(!applyTransaction(stateObject, transaction)) {
            //stateObject.setState(address, nonce, balance);            
            return;
        }
    }
    
    console.log(`------------ ${address}, ${Potential}-------------------`);
     for(let i of potentialList) {
         console.log(potentialList[i]);
     }
    console.log(`--------------------${address}, ${stateObject.account}---------------------`);

    stateDB.db.writePotential(address, potential);
    for(let potential of potentials) {
        stateDB.db.writePotential(potential.address, potential);
    }
    stateDB.setState(address, stateObject.account);
}


 module.exports = {
     operatorProcess,
     process
 }