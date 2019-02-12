"use-strict";
const { hashMessage, ecrecover, makeSignature } = require("../crypto");

/**
 * Represents the block header structure
 */
class Header {
  /**
   * @constructor
   *
   * @param {Hash}    previousHash
   * @param {Hash[]}  potentialHashList
   * @param {Account} accountState       State of the block producer's account after apply txs and potential.
   * @param {Hash}    merkleHash         All transactions' hash value
   * @param {Number}  difficulty
   * @param {Number}  timestamp
   * @param {Number}  nonce
   */
  constructor(
    previousHash,
    potentialHashList,
    accountState,
    merkleHash,
    difficulty,
    timestamp,
    nonce
  ) {
    this.data = {
      previousHash,
      potentialHashList,
      accountState,
      merkleHash,
      difficulty,
      timestamp,
      nonce
    };
  }

  hash() {
    if (this.blockHash) return this.blockHash;
    this.blockHash = hashMessage(this.data);
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
    this.header = header;
    this.transactions = transactions;
  }

  hash() {
    if (this.blockHash) return this.blockHash;
    this.blockHash = this.header.hash();
    return this.blockHash;
  }

  /**
   *
   * @param {Uint8Array}  sig
   */
  withSignature(sig) {
    this.r = sig.r;
    this.s = sig.s;
    this.v = sig.v;
  }
  /**
   *
   * @param {Block} block
   */
  sender(block) {
    if (!block.from) {
      block.from = ecrecover(block.hash(), block.r, block.s, block.v);
    }
    return block.from;
  }
}

/**
 *
 * @param {Block}       block
 * @param {PrivateKey}  prv
 */
function signBlock(block, prv) {
  let h = block.hash();
  let sig = makeSignature(h, prv);
  return block.withSignature(sig);
}

module.exports = {
  Header,
  Block,
  signBlock
};
