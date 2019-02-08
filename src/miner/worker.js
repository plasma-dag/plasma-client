"use strict";
const StateDB = require("../core/stateDB");
const Blockchain = require("../core/blockchain");
const em = require("../../tests/event_test").emitter;

/*TO DO : where is makeBlock()..? 
		  change to Big Integer
		  Add Eventemitter
		  Add calculateFee()
		  Add receiveBlock()
		  Set valueLimit
		  Set defaultFee
*/

/**
 * Task class for worker save current work information
 */

class Task {
	constructor() {
		this.State;
		this.Block;
		this.TxsCache = [];
		this.Fee = 0;
		this.TotalAmount = 0;

		//this.CreateAt = time();
	}
	get Block() {
		return this.Block;
	}
}

//Environment is the worker's current environment information
class Environment {
	/**
	 *
	 * @param {StateDB} state
	 * @param {*} lastCheckpoint
	 * @param {*} previousHash
	 * @param {*} transactions
	 * @param {*} defaultFee
	 * @param {*} valueLimit
	 * @param {*} txCount
	 */

	constructor(state, lastCheckpoint, previousHash, transactions) {
		this.currentState = state;
		this.lastCheckpoint = lastCheckpoint;
		this.previousHash = previousHash;
		this.transactions = transactions;
		this.defaultFee = defaultFee();
		this.valueLimit = valueLimit();
		this.txCount = 0;
	}
}

/**
 * Worker is set environment to commit new block work
 * @param {Address} address
 */

class Worker {
	constructor(opts) {
		this.db = opts.db;
		this.address = opts.address;
		this.isRunning = false;
		this.blockchain = new Blockchain(this.db, this.address);
		this.env = this.makeCurrent();

		//this.pending
	}

	//set current environment
	async makeCurrent() {
		const stateDB = new StateDB(this.db);
		const curEnv = new Environment(
			stateDB.getStateObject(),
			this.blockchain.getLastCheckpoint(),
			this.blockchain.getCurrentBlock(),
			await this.db.readTxs()
		);

		return curEnv;
	}
}

/**
 * create new worker and listen to the worker's event
 * @param {Address} address
 */

const mainWork = (opts) => {
	em.on("mainWork", () => console.log(`mainWork start!`));
	const worker = new Worker(opts);

	if (!worker.isRunning) {
		worker.isRunning = true;
		commitNewWork(worker);
	}

	/*TO DO : receiver가 되는 transaction을 event로 받고 receiveBlock()실행*/

	receiveBlock(worker, remoteBlockhash);
};

/**
 *
 * @param {Worker} w
 */

const commitNewWork = async (w) => {
	const newTask = new Task();

	if (isLocalTxs(w)) {
		//const count = w.env.transactions.length - 1;

		commitNewTransactions(w, w.env.transactions, newTask);

		//fee and all value amount exceed balance
		if (w.env.currentState.getBalance() <= newTask.TotalAmount + newTask.Fee) {
			console.error(`fee and all total value exceed the ${w.address}'s balance`);
		}

		//Add previousHash
		newTask.Block.header.previousHash = new Array(2).push(w.env.previousHash.hash());

		//create and mine block
		newTask.Block = makeBlock(newTask.TxsCache);

		/* newTask.newState = newTask.Block.header.accountState;
		 */
	}
};

/**
 *
 * @param {Worker} w
 * @param {Transactions} transactions
 * @param {Task} task
 */

const commitNewTransactions = (w, transactions, task) => {
	for (let tx of transactions) {
		task.Fee = 0;

		try {
			let validTx = txCheck(w, tx, task);

			//save all txs value
			task.TotalAmount += validTx.value;

			task.TxsCache.push(validTx);
		} catch (error) {
			console.log("error", error);
		}
	}

	return task.TxsCache;
};

/**
 * calculate fee and check transaction's value, return the value
 * if the value exceed the limit, the tx is cancelled.
 * if the value and the fee exceed the address's balance, the tx is cancelled.
 * @param {Worker} w
 * @param {Transaction} tx
 */

const txCheck = (w, tx, task) => {
	task.Fee = calculateFee();

	//Check the minimum fee
	task.Fee = task.Fee > w.env.defaultFee ? task.Fee : w.env.defaultFee;

	//Check the valueLimit
	if (tx.value > w.env.valueLimit) {
		console.error("value exceed the limit");
		/*TO DO : cancle tx logic or recommit */
	}

	return tx;
};

//TO DO : How to calculate tx's fee or block's fee

const calculateFee = () => {
	let fee = 100;
	return fee;
};

/**
 *
 * @param {Worker} w
 */

const isLocalTxs = (w) => {
	//receiver가 sender 와 다르면 본인이 sender일것이라 가정.
	return w.env.transactions[0].receiver !== w.address;
};

/**
 *
 * @param {Worker} w
 */

const isRemoteTxs = (w) => {
	return w.env.transactions[0].receiver === w.address;
};

/**
 *
 * @param {Worker} w
 * @param {*} remoteBlockhash
 */

const receiveBlock = (w, remoteBlockhash) => {
	if (!w.isRunning) {
		console.error(`${w.address}'s worker is not running`);
	}
	if (isRemoteTxs(w)) {
		//blockhash값을 previousBlock에 추가
		w.env.Block.hash.previousBlock.push(remoteBlockhash);
	}
};

const defaultFee = () => {
	return 100;
};

const valueLimit = () => {
	return 10000000;
};

const setRecommitInteval = () => {};

const getUnconfirmedBlock = (address) => {
	return;
};

module.exports = {
	Task,
	Environment,
	Worker,
	mainWork
};
