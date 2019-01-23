
"use strict";
const Transaction = require("../core/transaction");
const db = require("../db/database");


class Potential {

    constructor(address) {
        this.address = address;
        this.txHash = new Array();
        this.potential = {};
    
    }
    /**
     * potential at DB
     * {
     *  _id : address
     *  txHash : [...]
     */

    /**
     * TO DO :
     * operatorProcess 에서 실행
     * state_transition 중복되는 부분 수정 필요
     */
    addPotential(address,txHash) {

        const tx = Transaction.getTxDatabyHash(txHash);
        const sender = tx.data.sender;
        const receiver = tx.data.receiver;
        const value = tx.data.value;        

        if(address.account.balance == sender){
            //state_transition이랑 중복
            address.account.balance = -value;
            this.potential.txHash.push(txHash);
            
        }
        
        if(address.account.balance == receiver){
            if(db.findPotential(txHash)){
                db.removePotential(txHash);
            }
            //state_transition이랑 중복
            address.account.balance = +value;
        }

        db.writePotentialTx(address,txHash);

    }

    /**
     * 새 address생성시 함께 생성
     */
    createPotential(address) {
        db.newPotential(address);
    }
    
}

