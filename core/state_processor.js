/**
 * 트랜잭션이 처리됨에 따라 바뀌는 스테이트를 처리하는 로직이 여기 담긴다.
 * 스테이트를 처리하는 방법은 내가 갖고 있는 체인에 적용가능한 tx인지를 확인하고,
 * 한 단계 씩 순서대로 진행하면서 스테이트를 바꾸면 된다.
 */
'use strict';

const { stateDB } = require('./stateDB');
const { StateObject } = require('./stateObject');
const { Header } = require('./block');
const { Block } = require('./block');
const { applyStateTransition } = require('./state_transition');
const { calculateHash } = require('../common/utils');
const { Potential } = require('../core/potential');
const { PotentialDB } = require('../core/potential');

const receivePotential = (stateObjcet, potential) => {
    /**
     * 
     */
    if(stateObject.address != potential.address) {
        return Error('diffrent state and potential.');
    }
    
    const receiver = stateObject.address;
    const blockHashList = potential.blockHashList;
    for(let blockHash of blockHashList) {
        let block = findBlock(blockHash); // this block was validated validateBlock() function
        let transactions = findTransactions(block, receiver); 
        for(let transaction of transactions) {
            receiveStateTransition(stateObject, transaction);
        }
        potential.db.receivePotential(blockHash, receiver); // no db update
    }       
}

// for validated block
const operatorProcess = (stateDB, potentialDB, block) => {
    const blockOwnerAddress = block.header.data.state.address;
    const blockHash = calculateHash(blockToString(block));
    let blockOwnerState = stateDB.getStateObject(blockOwnerAddress);
    
    potentialDB.populate();
    let potentials = potentialDB.potentials;
    let blockOwnerPotential = potentialDB.potentials[blockOwnerAddress];
    let changePotentialList = []; // changed potential list for db update
    
    // receive potential
    receivePotential(blockOwnerState, blockOwnerPotential);
    // process transaction
    for(let transaction of block.transactions) {    
        let receiver = transaction.receiver;
        potentialDB.sendPotential(blockHash, receiver); // no db update
        changePotentialList.push(receiver);    
        sendStateTransition(blockOwnerState, transaction);
    }

    // validate state
    if(!validateState(blockOwnerState)) {
        return;
    }
    
    // update db after validate state 
    stateDB.setState(blockOwnerAddress, blockOwnerState.account);
    potentialDB.updatePotential(changePotentialList);
}

// this function is called after merkle proof of transaction tree, so includes verifed receiveTransactionList as parameter
const userProcess = (stateObject, block, receiveTransactionList) => {    
    const blockOwnerAddress = block.header.state.address;
    if(blockOwnerAddress !== stateObject.address) {
        return Error('diffrent state and potential.');
    }
    // console.log(`----------account is {nonce: ${stateObject.getNonce()}, balance: ${stateObject.getBalance()}}.----------------`);

    for(let receiveTransaction of receiveTransactionList) {
        receiveStateTransition(stateObject, receiveTransaction);
    }
    for(let sendTransaction of block.transactions) {    
        sendStateTransition(stateObject, Transaction);
        // console.log(`----------transaction is {nonce: ${transaction.accountNonce}, recipient: ${transaction.receiver}, sender: ${transaction.sender}, value: ${transaction.value}}`)
        // console.log(`----------account is {nonce: ${stateObject.getNonce()}, balance: ${stateObject.getBalance()}}.----------------`);
    }

    // validate state
    if(!validateState(stateObject)) {
        return;
    }

    stateObject.setState(address, stateObject.account);
}


/*
// add potential to receiver when send tx
if(address === transaction.sender) {
    let hash = calculateHash(transactionToString(transaction));            
    let index = potentialList.findIndex( potential => transaction.recipient === potential.address );
    if(index !== -1) {
        potentialList[index].add(transaction, hash);
    }
    else {
        let newPotential = new Potential(transaction.recipient, transaction, hash);
        potentialList.push(newPotential);
    }
    if(!sendTransaction(stateObject, transaction)) {
        //stateObject.setState(address, nonce, balance);            
        return;
    }
}
// remove potential when receive tx
else if(address === transaction.recipient) {
    let hash = calculateHash(transactionToString(transaction));
    potential.remove(potential.find(hash));
    if(!receiveTransaction(stateObject, transaction)) {
        //stateObject.setState(address, nonce, balance);            
        return;
    }
}   
*/

 module.exports = {
     operatorProcess,
     userProcess
 }