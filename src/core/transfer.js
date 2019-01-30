"use-strict"

const { Header, Block, signBlock } = require("./block");
const { BlockValidator } = require("./block_validator");
const { Blockchain } = require("./blockchain");
const { Checkpoint } = require("./checkpoint");
const { Potential, PotentialDB } = require("./potential");
const { operateStateProcess, userStateProcess } = require("./state_processor");
const { StateObject } = require("./stateObject");
const { Transaction } = require("./transaction");
const { Worker } = require("./worker");
const { Database } = require("../db/database");
const { merkle, merkleProof, verifyMerkle } = require("../crypto/index");

class Operator {    

    constructor(db, stateDB, potentialDB, state) {
        this.db = db;
        this.stateDB = stateDB;
        this.potentialDB = potentialDB;
        this.state = state;
        this.bc = new Blockchain(db, state.address);   
        this.blockValidator = new BlockValidator(db, bc, potentialDB);
    }

    // deposit phase 1
    deposit(value, contractBlock) {
        const result = this.blockValidator.validateContractBlock(contractBlock); // TODO
        if (result.error) return result;
        this.potentialDB.sendPotential(value, contractBlock.state.address);
        return { error: false };
    }

    /**
     * 
     * @param {*} block 
     * @param {*} prvKey 
     */
    BlockProcess(block, prvKey) {
        let result = this.blockValidator.validateBlock(block); // TODO: have to cover validating deposit block(deposit block has no tx)
        if (result.error) return result;
        // block process
        const opSigCheckpoint = operatorStateProcess(  
            this.db,
            this.stateDB,
            this.potentialDB,
            this.bc,
            block,
            prvKey,
            this.state.getNonce()
        );                    

        // transfer chceckpoint to block provider
        transfer( // TODO: network
            block.header.state.address, {
                checkpoint: opSigCheckpoint
            }
        );
        return { error: false };
    }
}

class UserTransfer {
    /**
     * 
     * @param {*} db 
     * @param {*} bc 
     * @param {*} state 
     * @param {*} potential 
     */
    constructor(db, bc, state, potential) {
        this.db = db;       
        this.bc = bc;
        this.state = state;
        this.potential = potential;
        this.blockValidator = new BlockValidator(db, bc, potential); // need potential db?
    }

    /**
     * 
     * @param {*} receiver 
     * @param {*} value 
     */
    makeTransaction(receiver, value) {
        this.db.writeTx(new Transaction(receiver, value));
    }
    
    /**
     * 
     * @param {*} prvKey 
     * @param {*} opAddr 
     */
    // cover making deposit block?
    makeBlock(prvKey, opAddr) {
        const previousHash = this.bc.getCurrentBlock().hash();
        const potentialHashList = this.potential.readPotentialList(); // TODO
        const accountState = this.state;
        const transactions = this.db.readTxs(); // TODO how many transcation?
        const difficulty = this.bc.getDifficulty();    // TODO
        const timestamp = Math.round(new Date().getTime() / 1000);

        // for merkle proof
        this.leaves = [];
        transactions.forEach( tx => this.leaves.push(tx.hash()) );
        const merkleHash = merkle(this.leaves); 

        // mining
        const worker = new Worker();
        const newBlock = worker.mineBlock(previousHash, potentialHashList, accountState, merkleHash, difficulty, timestamp, transactions);
        
        // transfer block, signature to operator
        const sig = signBlock(newBlock, prvKey);
        transfer( opAddr, { // TODO: network
            block: newBlock, 
            sig: sig
        });

        this.db.writeBlock(newBlock);
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

        // validate block and sender state proess        
        result = this.blockValidator.validateBlock(block);
        if (result.error) return result;
        result = userStateProcess(this.db, this.state, this.potential, this.bc, checkpoint, block);
        if(result.error) return { error: true };

        // transfer checkpoint, header, proof and root and tx for merkle proof to each receiver        
        const deps = block.transactions.length;        
        block.transactions.forEach( (tx, index) => transfer(tx.receiver, { // TODO: network
            checkpoint: checkpoint, 
            header: block.header, 
            deps: deps, 
            proof: merkleProof(this.leaves, index), 
            root: block.header.merkleHash, 
            tx: tx
        }));

        // initialize leaves
        this.leaves = [];
        this.db.removeTxs(block.transactions); // TODO
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
     * @param {*} opAddr 
     */
    confirmReceive(checkpoint, header, deps, proof, root, tx, opAddr) {
        // validate checkpoint
        let result = validateCheckpoint(this.bc, header.state.address, checkpoint, opAddr);
        if(result.error) return { error: true }; 

        // if block hash already exists in db, we don't have to check(proof)        
        if(this.potential.isExist(header.hash())) return { error: false };
        
        // verify merkle 
        if(!verifyMerkle(deps, proof, tx.hash(), root)) return { error: true };
        
        // update potential to user potential db
        this.potential.insert(header.hash());    
        return { error: false };
    }
}


// 다른 곳으로 이동 필요, validator?
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

module.exports = {
    Operator,
    UserTransfer
}