'use-strict';
const ut = require('../common/utils');

/**
 * Represents the block header structure
 */
class Header {
  /**
   * @constructor
   * 
   * @param {String} previousHash 
   * @param {Object} state state of the block producer's account
   * @param {String} txHash all transactions' hash value
   * @param {Number} difficulty 
   * @param {Number} number 
   * @param {Number} timestamp 
   * @param {Number} nonce 
   * @param {Object} checkpoint Operator's receipt about previous block, 꼭 직전의 블록일 이유는 없음.
   */
  constructor(previousHash, state, txHash, difficulty, number, timestamp, nonce, checkpoint) {
    this.data = {
        previousHash,
        state,
        txHash,
        difficulty,
        number,
        timestamp,
        nonce,
        checkpoint
    };
  }

  hash() {
    if (this.hash) return this.hash;
    this.hash = ut.calculateHash(this.data);
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
   * @param {Header} header this block's header
   * @param {Stirng} signature signature of block producer
   * @param {Transaction[]} transactions list of txs
   */
  constructor(header, signature, transactions) {
      this.header       = header;
      this.signature    = signature;
      this.transactions = transactions;
  }

  hash() {
    if (this.hash) return this.hash;
    this.hash = this.header.hash();
    // TODO: db storing
  }
  
}

module.exports = {
  Header,
  Block
}
