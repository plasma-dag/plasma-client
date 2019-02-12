"use-strict";
const { calculateSHA256 } = require("../crypto");

/**
 * Transaction
 */
class Transaction {
  /**
   * @constructor
   *
   * @param {address} receiver
   * @param {number}  value
   */
  constructor(receiver, value) {
    if (!(receiver || value)) {
      return Error("Not enough parameters");
    }
    this.data = {
      receiver,
      value
      // data,
    };
  }
  /**
   * Returns and saves hash value of tx data, exclude signature information
   */
  hash() {
    if (this.txHash) return this.txHash;
    // cache hash value
    const { receiver, value } = this.data;
    this.txHash = calculateSHA256({
      receiver,
      value
      // data,
    });
    return this.txHash;
  }
}

module.exports = {
  Transaction
};
