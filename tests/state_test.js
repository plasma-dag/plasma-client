
const { StateDB } = require("../core/StateDB.js");
const { Header } = require("../core/block.js");
const { Block } = require("../core/block.js");
const { Transaction } = require("../core/transaction.js");
const { StateDB } = require("../core/stateDB.js");
const { 
    StateObject, deepCopy 
} = require("../core/stateObject.js");
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
    let stateObject2 = deepCopy(stateObject);
    console.log(stateObject2);



    console.log("objects length: " + Object.keys(stateDB.stateObjects).length);
    console.log(stateObject.address + " " + stateObject.account);
    console.log(stateDB.stateObjects[1122]);
}


testState();