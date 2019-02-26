"use-strict";
const { makeSignature, hashMessage, ecrecover } = require("../crypto");

class Checkpoint {
  /**
   * @constructor
   *
   * @param {Address} address
   * @param {Hash}    blockHash
   * @param {Number}  operatorNonce
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

  withSignature(sig) {
    this.r = sig.r;
    this.s = sig.s;
    this.v = sig.v;
    return;
  }

  validate(opAddr) {
    if (!(this.r && this.s && this.v)) return { error: true };
    return { error: ecrecover(this.hash, this.r, this.s, this.v) !== opAddr };
  }
}

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
