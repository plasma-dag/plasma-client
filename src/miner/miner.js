"use strict";

const SHA256 = require("crypto-js/sha256");
const Block = require("../core/block");
const Transaction = require("../core/transaction");
const merkle = require("../crypto/index").merkle;

class Miner {
	constructor(bc, stateObj, potential) {
		if (bc.address !== stateObj.address) return Error("Address should be equal");
		this.bc = bc;
		this.state = stateObj;
		this.potential = potential;
		this.newTxs = [];
		this.curBlock;
		this.pendingBlock;
		this.pendingTxlist = [];
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
	refresh() {
		//deep copy
		this.pendingBlock = JSON.parse(JSON.stringify(this.curBlock));
		this.pendingTxlist = Array.prototype.slice.call(this.newTxs);
		this.newTxs = [];
		this.callcurBlock = null;
	}

	//makeTransaction 할때마다 block에 추가
	makeTx(receiver, value) {
		let tx = new Transaction(receiver, value);
		this.newTxs.push(tx);
		return this.newTxs;
	}

	/**
	 *
	 * @param {*} previousHash
	 * @param {StateObject} state
	 * @param {*} transactions
	 * @param {*} totalAmount
	 * @param {*} prvKey
	 */

	mineBlock(previousHash, state, transactions, totalAmount, prvKey) {
		while (this.isRunning) {
			const leaves = [];
			transactions.forEach((tx) => leaves.push(tx.hash()));
			const merkleHash = merkle(leaves);

			const timestamp = Math.round(new Date().getTime() / 1000);

			const difficulty = this.calcDifficulty(timestamp, previousHash, totalAmount);

			const nonce = this.mine(difficulty);

			const newBlock = new Block(previousHash, [], state, merkleHash, difficulty, timestamp, nonce);

			Block.signBlock(newBlock, prvKey);
			this.db.writeBlock(newBlock);

			//deepcopy
			this.curBlock = JSON.parse(JSON.stringify(newBlock));
			return newBlock;
		}
	}
	getCurrentBlock() {
		return this.pendingBlock;
	}

	getTxs() {
		return this.pendingTxlist;
	}

	/**
 *
 * ethash.go, miner.go sealer.go api.go참고
  algorithm.go
 *
 * Hashimoto() 우선 제외함
 *
 * @param {*} block
 * @param {*} previousBlock
 */

	mine(difficulty) {
		const target = 2 ** 256 / difficulty;
		let nonce = Math.floor(Math.random() * (2 ** 64 + 1));

		//while(hashimoto()>target)
		while (nonce > target) {
			nonce = (nonce + 1) % 2 ** 64;
		}
		return SHA256(nonce);
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
		expDiff = previousDiff + valueAdjust * Math.max(1 - (timestamp - previousTime) / 9, -99);

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
