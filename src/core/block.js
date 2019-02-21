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
  constructor({
    previousHash,
    potentialHashList,
    accountState,
    merkleHash,
    difficulty,
    timestamp,
    nonce
  }) {
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

  get hash() {
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
  constructor(header, transactions, r, s, v) {
    this.header = header;
    this.transactions = transactions;
    this.r = r;
    this.s = s;
    this.v = v;
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
   */

  get hash() {
    if (this.blockHash) return this.blockHash;
    this.blockHash = this.header.hash;
    return this.blockHash;
  }
  get sender() {
    if (!this.from) {
      this.from = ecrecover(this.hash, this.r, this.s, this.v);
    }
    return this.from;
  }
  get account() {
    return this.header.data.accountState;
  }
  get accountNonce() {
    return this.header.data.accountState.nonce;
  }
  get accountBalance() {
    return this.header.data.accountState.balance;
  }
  get potentialHashList() {
    return this.header.data.potentialHashList;
  }
  get previousHash() {
    return this.header.data.previousHash;
  }
  get timestamp() {
    return this.header.data.timestamp;
  }
  get blockNonce() {
    return this.header.data.nonce;
  }
  get difficulty() {
    return this.header.data.difficulty;
  }
  get merkleHash() {
    return this.header.data.merkleHash;
  }
}

/**
 *
 * @param {Block}       block
 * @param {PrivateKey}  prv
 */
function signBlock(block, prv) {
  let msg = block.header.data;
  let sig = makeSignature(msg, prv);
  return block.withSignature(sig);
}

module.exports = {
  Header,
  Block,
  signBlock
};
