"use strict";

const { Block, Header, signBlock } = require("../core/block");
const { Transaction } = require("../core/transaction");
const { merkle, hashMessage } = require("../crypto/index");
const { Database } = require("../db/index");

class Miner {
  constructor(db, bc, stateObj, potential) {
    if (bc.address !== stateObj.address)
      return Error("Address should be equal");
    this.bc = bc;
    this.state = stateObj;
    this.potential = potential;
    this.newTxs = [];
    this.isRunning = false;
    this.db = db;
  }
  /**
   * Enable mining
   */
  start() {
    this.isRunning = true;
  }
  /**
   * Disable mining
   */
  stop() {
    this.isRunning = false;
  }
  /**
   *
   * @param {Object} data
   */
  mine(data) {
    while (this.isRunning) {
      const hash = hashMessage(data);
      if (hash.slice(2, data.difficulty + 2) === "0".repeat(data.difficulty)) {
        return data;
      }
      data.nonce += 1;
    }

    return -1;
  }
  /**
   * Returns mined block with current environment, only available
   * when miner is enabled by start() method
   *
   * @param {*} prvKey
   */
  async mineBlock(prvKey) {
    await this.bc.init();
    const previousHash = this.bc.currentBlock.blockHash;
    const potentialHashList = this.potential.getHashList();
    const accountState = this.state.account;
    this.pendTx();
    const newTxs = this.pendingTxList;
    const leaves = newTxs.map(tx => tx.hash());
    const merkleHash = merkle(leaves);
    const difficulty = 1; // For test.
    const timestamp = Math.round(new Date().getTime() / 1000);
    const data = {
      previousHash,
      potentialHashList,
      accountState,
      merkleHash,
      difficulty,
      timestamp,
      nonce: 0
    };
    const result = this.mine(data);
    if (result === -1) {
      return Error("Miner is not enabled");
    }
    const newHeader = new Header();
    newHeader.data = result;
    const minedBlock = new Block(newHeader, newTxs);
    signBlock(minedBlock, prvKey);
    this.db.writeBlock(minedBlock);

    //deepcopy
    this.curBlock = JSON.parse(JSON.stringify(minedBlock));
    return minedBlock;
  }

  /**
   * Receives tx information and update newTx list
   *
   * @param {*} receiver
   * @param {*} value
   */
  makeTx(receiver, value) {
    const index = this.newTxs.findIndex(tx => tx.data.receiver === receiver);
    if (index !== -1) {
      // update exist tx's value
      return (this.newTxs[index].data.value += value);
    }
    let tx = new Transaction(receiver, value);
    return this.newTxs.push(tx);
  }
  /**
   * Refresh mined block and all tx list
   */
  refresh() {
    this.curBlock = undefined;
    this.pendingBlock = undefined;
    this.newTxs = [];
    this.pendingTxlist = [];
  }
  /**
   * Saves tx list temporarily
   * TODO: 지금은 모든 트랜잭션을 담아 만들어 tx 리스트를 그냥 없애버림.
   * 그러나 이는 블록에 담긴 tx들만 옮겨야 한다
   */
  pendTx() {
    this.pendingTxList = Array.prototype.slice.call(this.newTxs);
    this.newTxs = [];
  }
  pendBlock() {
    this.pendingBlock = JSON.parse(JSON.stringify(this.curBlock));
    this.curBlock = undefined;
  }
  /**
   * Recovers temporarily saved block and its tx list
   */
  recover() {
    this.pendingTxList.forEach(tx => this.makeTx(tx.receiver, tx.value));
    this.pendingTxList = [];
    this.curBlock = JSON.parse(JSON.stringify(this.pendingBlock));
  }

  // TODO: tx editing methods.

  get newTxList() {
    return this.newTxs;
  }
  get currentBlock() {
    return this.curBlock;
  }
  get pendingTxs() {
    return this.pendingTxlist;
  }

  /**
 * TO DO: mod연산 수정
 * 
    ethereum difficulty를 구하는 과정에서(consensus/ethash/consensus.go)
    adjust를 valueAdjust로 수정하고 uncle블록 관련과, POW줄이기위한 bombDelay는 제외함

    valueAdjust, minimumDiff, durationLimit은 조정가능
 * @param {*} block
 * @param {*} previousBlock
 */

  calcDifficulty(timestamp, previousBlock, totalAmount) {
    let diff = 0;
    let expDiff = 0;
    const adjust = previousBlock.difficulty / 2048; //2048 is difficultyBoundDivisor
    const previousTime = previousBlock.header.timestamp;
    const previousDiff = previousBlock.header.difficulty;
    const minimumDiff = 131072;

    // const durationLimit = 13;
    const value = totalAmount;
    let valueAdjust = adjust;

    //10000003은 소수 아무거나 정한거
    let mod = 10000003 % value;

    if (mod !== 0) {
      valueAdjust = mod / 2048;
    } else {
      mod = 10000003 % (value + 1);
      valueAdjust = (mod + 1) / 2048;
    }

    //이더리움의 경우 previousblock의 uncle block이 있으면 max 옆의 값을 1이아닌 2로 바꿔 계산
    expDiff =
      previousDiff +
      valueAdjust * Math.max(1 - (timestamp - previousTime) / 9, -99);

    /* durationLimit와 비교해 조정
    if ((time - previousIime) < (durationLimit)) {
        expDiff = previousDiff + adjust;
    } else {
        expDiff = prentDiff - adjust;
    } 
      */

    if (expDiff > minimumDiff) {
      diff = minimumDiff;
    } else diff = expDiff;

    return diff;
  }

  hashrate() {}
}

module.exports = {
  Miner
};
