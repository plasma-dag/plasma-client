"use strict"

const { Header } = require("../core/block.js");
const { Block } = require("../core/block.js");
const { Transaction } = require("../core/transaction.js");
const { StateDB } = require("../core/stateDB.js");
const { StateObject } = require("../core/stateObject.js")
const { Account } = require("../core/account.js");
const { operatorProcess } = require("../core/state_processor.js");
const { process } = require("../core/state_processor.js");
const { applyStateTransition } = require("../core/state_transition.js");
const { Database } = require('../db/database');


//import { Header, Block, Transaction, stateDB, StateObject, Account, operatorProcess, process, applyStateTransition } from "../core";

// async function read_block_test(promise) {
//     let a = await promise;
//     console.log(a);
//     return;
// }


const testState = () => {
    console.log("start test state!!!");
    
    const db1 = new Database();
    const db2 = new Database();
    let stateDB = new StateDB(db1);
    let account = new Account(0, 0, 0);
//    let stateObject = stateDB.createStateObject(1122, account, undefined);
    
    stateDB.setState(1122, account);
    let stateObject = new StateObject(1122, account, db2);

    console.log("objects length: " + Object.keys(stateDB.stateObjects).length);
    console.log(stateObject.address + " " + stateObject.account);
    console.log(stateDB.stateObjects[1122]);
    
    
    let { addr, state, previousHash, txHash, difficulty, number, timestamp, nonce, checkpoint } = {
        addr: [1122, 2233],
        state: stateObject,
        previousHash: 0,
        txHash: 0, 
        difficulty: 0, 
        number: 0, 
        timestamp: 0, 
        nonce: 0, 
        checkpoint: 0
    };
    
    
    
    let header = new Header(previousHash, state, txHash, difficulty, number, timestamp, nonce, checkpoint);    
    let sigList = [51234214, 12321415, 1232109, 0];
    let txList = [
        {accountNonce: 0, recipient: 1122, sender: 2184121, value: 999},
        {accountNonce: 999, recipient: 1122, sender: 18912, value: 1},
        {accountNonce: 0, recipient: 2123123, sender: 1122, value: 22},
        {accountNonce: 1, recipient: 89723214, sender: 1122, value: 800}
    ];
    let block = new Block(header, sigList, txList);
    //console.log(block.header.data.state);
    console.log(header);
    console.log(block);

    /*
    let { accountNonce, recipient, sender, value } = { 
        accountNonce: 0, 
        recipient: addr[1], 
        sender: addr[0], 
        value: 22        
    }
    let transaction = new Transaction(accountNonce, recipient, sender, value);
    txList.push(transaction);
    */
    
    
    
    operatorProcess(stateDB, block);
    //process(stateObject, block);
    
}



testState();