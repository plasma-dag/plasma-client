'use strict';
const { merkle } = require('../crypto');

const ERROR_INVALID_PREVIOUS_HASH       = 1;
const ERROR_INVALID_ACCOUNT_NONCE       = 2;
const ERROR_INVALID_MERKLE_HASH         = 3;
const ERROR_INVALID_TRANSACTION_VALUE   = 4;
const ERROR_INCORRECT_BALANCE_RESULT    = 5;

class BlockValidator {
    /**
     * @constructor
     * 
     * @param {Database}    db
     * @param {Blockchain}  bc
     * @param {PotentialDB} pdb
     */
    constructor(db, bc, pdb) {
        this.db     = db;
        this.bc     = bc;
        this.pdb    = pdb;
    }

    /**
     * Returns { error: ERROR_CODE } if block is not valid
     * 
     * @param {Block} block 
     */
    async validateBlock(block) {
        /**
         * 1. previousHash == current block hash?
         * 2. potentialHash exist in potential list? => calc bc.addr potential value.
         * 3. state.account.getNonce() == previousBlock.state.account.getNonce() + 1?
         * 4. tx merkleHash == merkle(txList)
         * 5. difficulty == block.hash() 앞 0의 개수 (TODO)
         * 6. tx value > 0
         * 7. previous balance + potential sum - tx value sum == current balance
         * 
         * 8. return true or false(reason);
         */
        // 1
        if (this.bc.currentBlock.hash() !== block.previousHash) {
            return { error: ERROR_INVALID_PREVIOUS_HASH };
        }
        // 3
        if (this.bc.currentBlock.header.state.getNonce() + 1 !== block.header.state.getNonce()) {
            return { error: ERROR_INVALID_ACCOUNT_NONCE };
        }
        // 4
        if (merkle(block.transactions) !== block.merkleHash) {
            return { error: ERROR_INVALID_MERKLE_HASH };
        }
        // 6
        let txValueSum = 0, potentialSum = 0;

        for (let i = 0; i < block.transactions.length; i++) {
            if( block.transactions[i].value <= 0 ) {
                return { error: ERROR_INVALID_TRANSACTION_VALUE };
            }
            txValueSum += block.transactions[i].value;
        }
        // 2
        if (potentialHashList.length) {
            const filteredPotential = potentialHashList.filter(hash => this.pdb.isExist(hash, bc.address))
            const promises = filteredPotential.forEach(hash => this.db.readBlock(hash));
            const result = await Promise.all(promises);
            potentialSum = result.reduce((prev, curr) => prev + sumReceiveTx(curr, bc.address), potentialSum)
        }
        // 7
        if (bc.currentBlock.state.getBalance() + potentialSum - txValueSum !== block.state.getBalance()) {
            return { error: ERROR_INCORRECT_BALANCE_RESULT };
        }
        return { error: false };
    }
}

function sumReceiveTx(block, addr) {
    return block.transactions.reduce((prev, curr) => curr.receiver === addr ? prev + curr.value : prev, 0);
}

module.exports = {
    BlockValidator,
};
