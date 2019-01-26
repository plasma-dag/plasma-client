'use-strict';
const ut = require('../common/utils');

/**
 * Represents the block header structure
 */
class Header {
  /**
   * @constructor
   * 
   * @param {Hash}   previousHash       Previous Block Hash
   * @param {Hash[]} potentialHashList  Block Hashes of blocks making potentials concerning txs in this block
   * @param {Object} state              State of the block producer's account after apply txs and potential.
   * @param {Hash}   merkleHash         All transactions' hash value
   * @param {Number} difficulty 
   * @param {Number} timestamp 
   * @param {Number} nonce
   */
  constructor(previousHash, potentialHashList, state, merkleHash, difficulty, timestamp, nonce) {
    this.data = {
        previousHash,
        potentialHashList,
        state,
        merkleHash,
        difficulty,
        timestamp,
        nonce,
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
   * Gets an address value and returns txhash[] with matching address as a receiver.
   * @param {String} address 
   */
  getTransactionList(address) {
    const filteredTxs = this.transactions.filter(tx => address === tx.receiver)
    return filteredTxs.map(tx => tx.hash())
  }

  /**
   * Create merkle tree using txHash
   * TODO : MerkleTree class ?
   */
  createMerkle(){
    const leaves = this.transactions.map(tx => tx.hash())
    const tree = new MerkleTree(leaves, sha256)

    //root type : Buffer - (Merkle Root hash as a buffer)
    const root = tree.getRoot()
    return root

  }

}

module.exports = {
  Header,
  Block
}
