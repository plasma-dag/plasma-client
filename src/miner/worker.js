"use strict";
const Database = require("../db/index");
const StateDB = require("../core/stateDB");
const Blockchain = require("../core/blockchain");

/*TO DO : where is makeBlock()..? 
		  change to Big Integer
		  Add Eventemitter
		  Add calculateFee()
		  Add receiveBlock()
		  Set valueLimit
*/

/**
 * Task class for worker to save current work
 */

class Task {
	constructor() {
		this.State;
		this.Block;
		this.TxsCache = [];
		this.TxCount = 0;
		this.Fee = 0;
		this.Amount = 0;
		this.expectedFee = 0;

		//this.CreateAt = time();
	}
	get Block() {
		return this.Block;
	}
}

/**
 * Environment class for worker
 */

class Environment {
	constructor(state, signer, lastCheckpoint, previousHash, transactions) {
		this.currentState = state;
		this.signer = signer;
		this.lastCheckpoint = lastCheckpoint;
		this.previousHash = previousHash;
		this.transactions = transactions;
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

	/**
	 * set current environment
	 */

	makeCurrent() {
		const stateDB = new StateDB(this.db);
		const curEnv = new Environment(
			stateDB.getStateObject(),
			stateDB.address,
			this.blockchain.getLastCheckpoint(),
			this.blockchain.getCurrentBlock(),
			[]
		);

		return curEnv;
	}
}

/**
 * create new worker and listen to the worker's event
 * @param {Address} address
 */

const mainWork = (opts) => {
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

	//get transactions
	w.env.transactions = await this.db.readTxs();

	if (isLocalTxs(w)) {
		//const count = w.env.transactions.length - 1;

		commitNewTransactions(w, w.env.transactions, newTask);

		//fee and all value amount exceed balance
		if (w.env.currentState.getBalance() <= newTask.Amount + newTask.Fee) {
			console.error(`fee and all value amount exceed ${w.address}'s balance`);
		}

		//Add previousHash
		newTask.Block.header.previousHash = new Array(2).push(w.env.previousHash.hash());

		//create block
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
	/*TO DO : deafultFee와 한 tx당, block당 value limit을 계산하는 함수 필요 */

	//let defaultFee = 100;

	for (let tx of transactions) {
		//task.Fee = defaultFee;d

		try {
			let result = txCheck(w, tx, task);

			//Add all txs value
			task.Amount += result;

			task.TxsCache.push(task.Amount);
		} catch (error) {
			console.log("error", error);
		}
	}

	return task.TxsCache;
};

/**
 * calculate fee and check transaction's value, return the value
 * if the value exceed the limit, the tx is cancled.
 * if the value and the fee exceed the address's balance, the tx is cancled.
 * @param {Worker} w
 * @param {Transaction} tx
 */

const txCheck = (w, tx) => {
	return new Promise((resolve) => {
		// TO DO : get valueLimit
		const valueLimit = 10000000;
		const fee = calculateFee();

		//Check the valueLimit
		if (tx.value > valueLimit) {
			console.error("value exceed the limit");
			/*TO DO : cancle tx logic or recommit */
		}

		//Check the balance
		if (tx.value + fee >= w.env.currentState.getBalance()) {
			console.error(`value + fee exceed the ${w.address}'s balance`);
		}
		return tx.value;
	});
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
