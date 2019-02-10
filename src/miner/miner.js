"use strict";
const bigInt = require("big-integer");

class Miner {
  constructor(bc, stateObj, potential) {
    if (bc.address !== state.address) return Error("Address should be equal");
    this.bc = bc;
    this.state = stateObj;
    this.potential = potential;
    this.newTxs = [];
    this.isRunning = false;
  }

  get newTxList() {
    return this.newTxs;
  }

  addNewTx(tx) {
    this.newTxs.push(tx);
  }

  start() {
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
  }

  mineBlock() {
    while (this.isRunning) {}
  }
}
/**
 * Hashimoto() 우선 제외함
 *
 * @param {*} block
 * @param {*} previousBlock
 */

const mine = (block, previousBlock) => {
  const difficulty = calcDifficulty(block, previousBlock);

  const target = new bigInt(2 ** 256 / difficulty);
  let nonce = Math.floor(Math.random() * (2 ** 64 + 1));

  //while(hashimoto()>target)
  while (nonce > target) {
    nonce = (nonce + 1) % 2 ** 64;
  }
  return nonce;
};

/**
 * TO DO: mod연산 수정
 * 
    ethereum difficulty를 구하는 과정에서(consensus/ethash/consensus.go)
    adjust를 valueAdjust로 수정하고 uncle블록 관련과, POW줄이기위한 bombDelay는 제외함

    valueAdjust, minimumDiff, durationLimit은 조정가능
 * @param {*} block
 * @param {*} previousBlock
 */

const calcDifficulty = (block, previousBlock) => {
  let diff = 0;
  let expDiff = 0;
  const adjust = previousBlock.difficulty / 2048; //2048 is difficultyBoundDivisor
  const time = block.header.timestamp;
  const previousTime = previousBlock.header.timestamp;
  const previousDiff = previousBlock.header.difficulty;
  const minimumDiff = 131072;

  // const durationLimit = 13;
  const value = block.header.value;
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
    previousDiff + valueAdjust * Math.max(1 - (time - previousTime) / 9, -99);

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
};

const hashrate = () => {};

module.exports = {
  Miner,
  mine
};
