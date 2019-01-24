"use strict";
const Transaction = require("../core/transaction");
const db = require("../db/database");
const { calculateHash } = require("../common/utils");

/**
 * potential Data at DB
 * {
 *  _id : address
 *  txHashList : [...]
 * }
 */
class Potential {
    /**
     * @constructor
     * 
     * @param {Database}  db          Database instance
     * @param {Address}   address     Potential owner's address
     * @param {Hash[]}    txHashList  Unreceived txId list 
     */
    constructor(db, address, txHashList) {
        this.db         = db;
        this.address    = address;
        this.txHashList = txHashList;
    }

    async save() {
        return await this.db.writePotential(this.address, this.txHashList);
    }

    insert(txHash) {
        this.txHashList.push(txHash);
        this.save();
    }
    
    remove(txHash) {
        if (this.txHashList.includes(txHash)) {
            this.txHashList.filter(d => d !== txHash);
            this.save();
            return true;
        }
        return Error('No matching sendTx in transaction list');
    }
}

class PotentialDB {
    constructor(db) {
        this.db = db;
        this.potentials = {};
        this.populate();
    }

    async populate() {
        const res = await this.db.readAllPotentials();
        for (p in res) {
            this.potentials[p.address] = new Potential(this.db, p.address, p.txHashList);
        }
    }

    getSendTx(sendTx) {
        const { receiver } = sendTx;
        // Potential already exist
        if (this.potentials[receiver]) {
            return this.potentials[receiver].insert(sendTx.hash());
        }
        // make new Potential for receiver
        this.potentials[receiver] = new Potential(this.db, receiver, sendTx.hash());
        this.potentials[receiver].save();
    }

    getReceiveTx(receiveTx) {
        const { receiver } = receiveTx;
        // Available potential is exist
        if (this.potentials[receiver]) {
            return this.potentials[receiver].remove(receiveTx.hash());
        }
        return Error("No Potential for receiver address");
    }
}

// 이 함수는 왜 여기 있는건지 모르겠음. 오퍼레이터가 행동하는 함수들로 묶어버리는게 좋을듯.
/**
 * Run by operatorProcess
 * @param {*} address 
 * @param {Transaction} tx 
 */
function potentialProcess(address,tx) {

    let potentialData = this.getPotentialData(address);
    let hash = calculateHash(transaction.data).toString();
    const sender = tx.data.sender;
    const receiver = tx.data.receiver;

    // Add potential to receiver when send tx
    if(address === sender){
        let index = potentialData.findIndex( potential => tx.receiver === potential.address );
        if(index !== -1) {
            potentialData[index].potentialList.add(hash);
        }
        else {
            let newPotential = new Potential(address,hash);
            potentialData.push(newPotential);
        }

        this.savePotentialData(address,hash);
    }
        
    // Remove potential when receive tx
    else if(address === receiver){
        if(potentialData.address.find(hash) !== undefined){                
            this.removePotential(hash);
        }
    }

    //log
    console.log(`------------ address: ${potentialData.address}, potentialList: ${potentialData.potentialList}-------------------`);
    for(let i of potentialData.potentialList) {
        console.log(potentialData.potentialList[i]);
    }
}


module.exports = {
    Potential,
    PotentialDB
};
