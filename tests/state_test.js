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


//import { Header, Block, Transaction, stateDB, StateObject, Account, operatorProcess, process, applyStateTransition } from "../core";


function testState() {
    console.log("start test state!!!");
    
    let stateDB = new StateDB(undefined);
    let account = new Account(0, 0, 0);
    let stateObject = stateDB.createStateObject(1122, account, undefined);

    console.log("objects length: " + Object.keys(stateDB.stateObjects).length);
    console.log(stateObject.address + " " + stateObject.account);
    console.log(stateDB.stateObjects[1122]);
    
    
    let addr = [1122, 2233];
    let previousHash = 0;
    let state  = stateObject;
    let txHash = 0;
    let difficulty = 0;
    let number = 0;
    let timestamp = 0;
    let nonce = 0;
    let checkpoint = 0;
    
    
    let header = new Header(previousHash, state, txHash, difficulty, number, timestamp, nonce, checkpoint);
    
    let sigList = [];
    let txList = [];
    let block = new Block(header, sigList, txList);
    
    

    
    let { accountNonce, recipient, sender, value } = { 
        accountNonce: 0, 
        recipient: addr[1], 
        sender: addr[0], 
        value: 22        
    };
    let transaction = new Transaction(accountNonce, recipient, sender, value);
    let signature = 0;
    
    txList.push(transaction);
    sigList.push(signature);
    
    console.log(header);
    console.log(block);
    //operatorProcessor(blockchain, stateDB, block, blockProducerAddr);
    console.log(process(stateObject, block));
    
}



testState();