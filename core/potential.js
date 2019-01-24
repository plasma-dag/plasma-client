"use strict";
const Transaction = require("../core/transaction");
const db = require("../db/database");
const { calculateHash } = require("../common/utils");

/**
 * potential Data at DB
 * {
 *  address,
 *  blockHashList
 * }
 */
class Potential {
    /**
     * @constructor
     * 
     * @param {Database}  db              Database instance
     * @param {Address}   address         Potential owner's address
     * @param {Hash[]}    blockHashList   Unreceived block hash list 
     */
    constructor(db, address, blockHashList) {
        this.db             = db;
        this.address        = address;
        this.blockHashList  = blockHashList;
    }

    async save() {
        return await this.db.writePotential(this.address, this.blockHashList);
    }

    insert(blockHash) {
        this.blockHashList.push(blockHash);
        this.save();
    }
    
    remove(blockHash) {
        if (this.blockHashList.includes(blockHash)) {
            this.blockHashList.filter(d => d !== blockHash);
            this.save();
            return true;
        }
        return Error('No matching blockHash in potential');
    }
}

class PotentialDB {
    constructor(db) {
        this.db = db;
        this.potentials = {};
        this.populate();
    }
    /**
     * TO DO :이거 constrcut에서 실행 안되는걸로 알고있는데 확인좀.
     */
    async populate() {
        const res = await this.db.readAllPotentials();
        for (p in res) {
            this.potentials[p.address] = new Potential(this.db, p.address, p.blockHashList);
        }
    }
    /**
     * 
     * @param {*} blockHash 
     * @param {address} receiver 
     */
    sendTxPotential(blockHash, receiver) {
        // Potential already exist
        if (this.potentials[receiver]) {
            return this.potentials[receiver].insert(blockHash);
        }
        // make new Potential for receiver
        this.potentials[receiver] = new Potential(this.db, receiver, [ blockHash ]);
        return this.potentials[receiver].save();
    }
    /**
     * 
     * @param {*} blockHash 
     * @param {address} receiver 
     */
    receiveTxPotential(blockHash, receiver) {
        // Available potential is exist
        if (this.potentials[receiver]) {
            return this.potentials[receiver].remove(blockHash);
        }
        return Error("No Potentials for receiver address");
    }
}

// TO DO : potential도 block단위로 처리하게 되면서, operator가 block처리하는 process 만들어지면 그때 옮길지 결정
/**
 * Run by operatorProcess for block
 * @param {*} address 
 * @param {Block} block
 */
function potentialProcess(address,block) {

    //let potentialData = this.getPotentialData(address);
    let hash = block.hash();
    const sender = tx.data.sender;
    const receiver = tx.data.receiver;

    // Add potential to receiver when send tx
    if ( address === sender ){
        PotentialDB.sendTxPotential( hash, receiver );
    }
    // Remove potential when receive tx
    else if ( address === receiver ){
        PotentialDB.receiveTxPotential( hash, receiver );
    }

    // // Add potential to receiver when send tx
    // if(address === sender){
    //     let index = potentialData.findIndex( potential => tx.receiver === potential.address );
    //     if(index !== -1) {
    //         potentialData[index].potentialList.add(hash);
    //     }
    //     else {
    //         let newPotential = new Potential(address,hash);
    //         potentialData.push(newPotential);
    //     }

    //     this.savePotentialData(address,hash);
    // }
        
    // // Remove potential when receive tx
    // else if(address === receiver){
    //     if(potentialData.address.find(hash) !== undefined){                
    //         this.removePotential(hash);
    //     }
    // }

    // //log
    // console.log(`------------ address: ${potentialData.address}, potentialList: ${potentialData.potentialList}-------------------`);
    // for(let i of potentialData.potentialList) {
    //     console.log(potentialData.potentialList[i]);
    // }
}


module.exports = {
    Potential,
    PotentialDB
};
