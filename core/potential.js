'use strict';
const db = require("../db/database");

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
    sendPotential(blockHash, receiver) {
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
    receivePotential(blockHash, receiver) {
        // Available potential is exist
        if (this.potentials[receiver]) {
            return this.potentials[receiver].remove(blockHash);
        }
        return Error("No Potentials for receiver address");
    }
}


module.exports = {
    Potential,
    PotentialDB : potentialDB
};