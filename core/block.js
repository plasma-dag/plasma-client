'use-strict';
const ut = require('../common/utils');

/**
 * Represents the block header structure
 */
class Header {
  /**
   * @constructor
   * 
   * @param {Hash[]} previousHash 
   * @param {Object} state state of the block producer's account
   * @param {Hash} merkleHash all transactions' hash value
   * @param {Number} difficulty 
   * @param {Number} number 
   * @param {Number} timestamp 
   * @param {Number} nonce 
   * @param {Object} checkpoint Operator's receipt about previous block, 꼭 직전의 블록일 이유는 없음.
   */
  constructor(previousHash, state, merkleHash, difficulty, number, timestamp, nonce, checkpoint) {
    this.data = {
        previousHash,
        state,
        merkleHash,
        difficulty,
        number,
        timestamp,
        nonce,
        checkpoint
    };
  }

  hash() {
    if (this.blockHash) return this.blockHash;
    this.blockHash = ut.calculateHash(this.data);
    return this.blockHash;
    // TODO: db storing
  }
}

/**
* Represents the block structure
*/
class Block {
  /**
   * @constructor
   * 
   * @param {Header}        header        this block's header
   * @param {Transaction[]} transactions  list of txs
   */
  constructor(header, transactions) {
      this.header       = header;
      this.transactions = transactions;
  }

  hash() {
    if (this.blockHash) return this.blockHash;
    this.blockHash = this.header.hash();
    return this.blockHash;
    // TODO: db storing
  }

  /**
   * 
   * @param {Signer}      signer 
   * @param {Uint8Array}  sig 
   */
  withSignature(signer, sig) {
    const { r, s, v, error } = signer.signatureValues(sig);
    if (error) { return error; }
    this.r = r;
    this.s = s;
    this.v = v;
    return;
  }

  /**
   * Save to transactions
   */
  getTransactionList(address) {
    
  }

  /**
   * Create merkle tree using txHash
   */
  createMerkle(){

  }

}

module.exports = {
  Header,
  Block
}
