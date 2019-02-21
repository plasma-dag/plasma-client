"use-strict";
const { makeSignature, hashMessage, ecrecover } = require("../crypto");

/**
 * Represents Checkpoint structure
 * Checkpoint is the finalization of a block by the Operator.
 * Operator finalizes a block by making a checkpoint with the block's hash, with his/her signature.
 */

class Checkpoint {
  /**
   * @constructor
   *
   * @param {Address} address         User's address
   * @param {Hash}    blockHash       Block Hash of a block which is finalized by Operator
   * @param {Number}  operatorNonce   Nonce that Operator uses to order checkpoints
   */
  constructor(address, blockHash, operatorNonce, r, s, v) {
    this.address = address;
    this.blockHash = blockHash;
    this.operatorNonce = operatorNonce;
    this.r = r;
    this.s = s;
    this.v = v;
  }

  get hash() {
    if (this.opHash) return this.opHash;
    this.opHash = hashMessage({
      address: this.address,
      blockHash: this.blockHash,
      operatorNonce: this.operatorNonce
    });
    return this.opHash;
  }

  /**
   * Gets a signature and stores the r,s,v value in the object
   * @param {Signature} sig
   */
  withSignature(sig) {
    this.r = sig.r;
    this.s = sig.s;
    this.v = sig.v;
    return;
  }

  /**
   * Check if the signature(r,s,v) of the checkpoint is correct
   * @param {Address} opAddr
   */
  validate(opAddr) {
    if (!(this.r && this.s && this.v)) return { error: true };
    return { error: ecrecover(this.hash, this.r, this.s, this.v) !== opAddr };
  }
}

/**
 * Makes a signature of Checkpoint with private key, and stores r,s,v of the signature
 * @param {Checkpoint} cp
 * @param {String} prv
 */
function signCheckpoint(cp, prv) {
  const data = {
    address: cp.address,
    blockHash: cp.blockHash,
    operatorNonce: cp.operatorNonce
  };
  const sig = makeSignature(data, prv);
  return cp.withSignature(sig);
}

module.exports = {
  Checkpoint,
  signCheckpoint
};
