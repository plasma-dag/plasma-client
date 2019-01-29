"use-strict"

const { Header, Block, signBlock } = require("./block");
const { Blockchain } = require("./blockchain");
const { Checkpoint } = require("./checkpoint");
const { Potential } = require("./potential");
const { operateStateProcess, userStateProcess } = require("./state_processor");
const { StateObject } = require("./stateObject");
const { Transaction } = require("./transaction");
const { Worker } = require("./worker");
const { Database } = require("../db/database");
const { merkle, merkleProof, verifyMerkle } = require("../crypto/index");

class userTransfer {
    /**
     * 
     * @param {*} db 
     * @param {*} potential 
     * @param {*} bc 
     * @param {*} state 
     */
    constructor(db, potential, bc, state) {
        this.db = db;
        this.potential = potential;
        this.bc = bc;
        this.state = state;
    }

    /**
     * 
     * @param {*} receiver 
     * @param {*} value 
     */
    makeTransaction(receiver, value) {
        this.db.writeTx(new Transcation(receiver, value));
//        this.transactions.push(transaction); 
    }
    
    /**
     * 
     * @param {*} prvKey 
     * @param {*} opAddr 
     */
    makeBlock(prvKey, opAddr) {
        
        const previousHash = this.bc.getCurrentBlock().hash();
        const potentialHashList = this.potential.readPotentialList(); // TODO
        const accountState = this.state;
        const transactions = this.db.readAllTxs(); // TODO
        
        // leaves for merkle tree
        this.leaves = [];
        transactions.forEach( tx => this.leaves.push(tx.hash()) );
        const merkleHash = merkle(this.leaves); 
        const difficulty = this.bc.getDifficulty();    // TODO
        const timestamp = Math.round(new Date().getTime() / 1000);
        
        // mining
        const worker = new Worker();
        const nonce = worker.mineBlock(previousHash, potentialHashList, accountState, merkleHash, difficulty, timestamp); // TODO

        // generates block header
        const header = new Header({
            previousHash, 
            potentialHashList, 
            accountState, 
            merkleHash, 
            difficulty, 
            timestamp, 
            nonce
        });

        // generates block
        const block = new Block(header, transactions); 
        
        // transfer block, signature to operator
        const sig = signBlock(block, prvKey);
        transfer( opAddr, {
            block: block, 
            sig: sig
        });

        this.db.writeBlock(block);
        return { error: false };
    }

    /**
     * 
     * @param {*} checkpoint 
     * @param {*} opAddr 
     */
    async confirmSend(checkpoint, opAddr) {
        // 1
        let result = validateCheckpoint(this.bc, this.state.address, checkpoint, opAddr);
        if(result.error) return { error: true };

        // 2
        const block = await db.readBlock(checkpoint.blockHash);
        if(block) return { error: true };

        // sender state proess
        result = userStateProcess(this.db, this.state, this.bc, checkpoint, opAddr, block);
        if(result.error) return { error: true };

        // transfer checkpoint, header, proof and root and tx for merkle proof to each receiver        
        const deps = block.transactions.length;        
        block.transactions.forEach( (tx, index) => transfer(tx.receiver, {
            checkpoint: checkpoint, 
            header: block.header, 
            deps: deps, 
            proof: merkleProof(this.leaves, index), 
            root: block.header.merkleHash, 
            tx: tx
        }));

        // initialize leaves
        this.leaves = [];
        this.db.removeAllTxs(); // TODO
        return { error: false };
    }
    
    /**
     * 
     * @param {*} checkpoint 
     * @param {*} header 
     * @param {*} deps 
     * @param {*} proof 
     * @param {*} root 
     * @param {*} tx 
     */
    confirmReceive(checkpoint, header, deps, proof, root, tx, opAddr) {
        // validate checkpoint
        let result = validateCheckpoint(this.bc, header.state.address, checkpoint, opAddr);
        if(result.error) return { error: true }; 

        // if block hash already exists in db, we don't have to check(proof)        
        if(this.potential.isExist(header.hash())) return { error: false };
        
        // verify merkle 
        if(!verifyMerkle(deps, proof, tx.hash(), root)) return { error: true };
        
        // update potential to db
        this.potential.insert(header.hash());    
        return { error: false };
    }
}

/**
 * 
 * @param {*} bc 
 * @param {*} sender 
 * @param {*} checkpoint 
 * @param {*} opAddr 
 */
const validateCheckpoint = function(bc, sender, checkpoint, opAddr) {
    if(!checkpoint.validate(opAddr)) return { error: true };
    if(checkpoint.address !== sender) return { error: true };
    if(bc.checkpoint.operatorNonce >= checkpoint.operatorNonce)
        return { error: true };
}



class operatorTransfer {    
    /**
     * 
     * @param {*} db 
     * @param {*} stateDB 
     * @param {*} potentialDB 
     * @param {*} bc 
     * @param {*} addr 
     */
    constructor(db, stateDB, potentialDB, bc, addr) {
        this.db = db;
        this.stateDB = stateDB;
        this.potentialDB = potentialDB;
        this.bc = bc;   
        this.addr = addr;
    }

    preProcess(block, prvKey) {

        const opState = stateDB.getStateObject(this.addr);

        const opSigCheckpoint = operatorStateProcess(  
            this.db,
            this.stateDB,
            this.potentialDB,
            bc,
            block,
            prvKey,
            opState.getNonce()
        );
        
        transfer(
            block.header.state.address, 
            {
                checkpoint: opSigCheckpoint
        })

    }


}

module.exports = {
    operatorTransfer,
    userTransfer
}