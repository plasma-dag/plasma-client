"use strict";
const Transaction = require("../core/transaction");
const db = require("../db/database");
const calculateHash = require("../common/utils");

class Potential {
    /**
     * @constructor
     * 
     * @param {*} address 
     * @param {*} txHash 
     */
    constructor(address,txHash) {
        this.txHash = txHash;
        this.data = {
            address,
            potentialList = []
        };
    }

    /**
     * potentialData at DB
     * {
     *  _id : address
     *  potentialList : [...]
     */


    /**
     * Create potential DB for new address
     * Use this method when create new address
     */
    createPotentialData(address) {
        db.writePotential(address);
    }

    /**
     * 
     * @param {*} address 
     * @param {*} hash 
     */
    savePotentialData(address,hash) {
        db.writePotential(address,hash);
    }

    /**
     * return potential data from DB
     * @param {*} address 
     */
    getPotentialData(address) {
        this.data = db.readAllPotentials(address);
    }

    /**
     * return potential data from DB
     * @param {*} hash 
     */
    getPotentialbyHash(hash) {
        db.findPotential(hash);
    }

    /**
     * remove potential data when it is processed
     * @param {*} hash 
     */
    removePotential(hash) {
        const processedHash = this.getPotentialbyHash(hash);
        db.removePotential(processedHash);
    }

    /**
     * Run by operatorProcess
     * @param {*} address 
     * @param {Transaction} tx 
     */
    potentialProcess(address,tx) {

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
}


module.exports = {
    Potential
};
