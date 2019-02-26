"use strict";
const { merkle } = require("../crypto");

const ERROR_INVALID_PREVIOUS_HASH = "Invalid previous hash";
const ERROR_INVALID_ACCOUNT_NONCE = 2;
const ERROR_INVALID_MERKLE_HASH = 3;
const ERROR_INVALID_TRANSACTION_VALUE = 4;
const ERROR_INCORRECT_BALANCE_RESULT = 5;

class BlockValidator {
  /**
   * @constructor
   *
   * @param {Database}    db
   * @param {Blockchain}  bc
   * @param {PotentialDB} pdb
   */
  constructor(db, bc, pdb) {
    this.db = db;
    this.bc = bc;
    this.pdb = pdb;
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
     * 5. difficulty == block.hash 앞 0의 개수 (TODO)
     * 6. tx value > 0
     * 7. previous balance + potential sum - tx value sum == current balance
     *
     * 8. return true or false(reason);
     */
    // 1
    if (this.bc.currentBlock.hash !== block.previousHash) {
      return { error: ERROR_INVALID_PREVIOUS_HASH };
    }
    // 3
    if (this.bc.currentBlock.accountNonce + 1 !== block.accountNonce) {
      return { error: ERROR_INVALID_ACCOUNT_NONCE };
    }
    // 4
    if (merkle(block.transactions.map(tx => tx.hash)) !== block.merkleHash) {
      return { error: ERROR_INVALID_MERKLE_HASH };
    }
    // 6
    let txValueSum = 0,
      potentialSum = 0;

    for (let i = 0; i < block.transactions.length; i++) {
      if (block.transactions[i].value <= 0) {
        return { error: ERROR_INVALID_TRANSACTION_VALUE };
      }
      txValueSum += block.transactions[i].value;
    }
    // 2
    if (block.potentialHashList.length) {
      const filteredPotential = block.potentialHashList.filter(hash =>
        this.pdb.isExist(hash, this.bc.address)
      );
      const promises = filteredPotential.map(hash => this.db.readBlock(hash));
      const result = await Promise.all(promises);
      potentialSum = result.reduce((prev, curr) => {
        return prev + sumReceiveTx(curr, this.bc.address);
      }, potentialSum);
    }
    // 7
    if (
      this.bc.currentBlock.accountBalance + potentialSum - txValueSum !==
      block.accountBalance
    ) {
      return { error: ERROR_INCORRECT_BALANCE_RESULT };
    }
    return { error: false };
  }
}

function sumReceiveTx(block, addr) {
  return block.transactions.reduce(
    (prev, curr) =>
      curr.data.receiver === addr ? prev + curr.data.value : prev,
    0
  );
}

/**
 *
 * @param {*} sender
 * @param {*} checkpoint
 * @param {*} blockHeaderHash
 * @param {*} opAddr
 */
const validateCheckpoint = function(
  sender,
  checkpoint,
  blockHeaderHash,
  opAddr
) {
  if (!checkpoint.validate(opAddr)) return { error: true };
  if (checkpoint.address !== sender) return { error: true };
  if (checkpoint.blockHash !== blockHeaderHash) return { error: true };
  return { error: false };
};

module.exports = {
  BlockValidator,
  validateCheckpoint
};
