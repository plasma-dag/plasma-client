"use strict";
const Database = require("../db/index");
const StateDB = require("../core/stateDB");
const Blockchain = require("../core/blockchain");
const Transfer = require("./transfer");

/*TO DO : transfer의 maketransaction(), makeBlock()을 사용, 서로 보완, 수정 필요
		  change to Big Integer
		  Add Event and listener
		  isRunning
		  calculateFee
*/

/**
 * Task class for worker to save current work
 */

class Task {
	constructor() {
		this.State; // = new StateDB();
		this.Block; // = new Block();
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
	constructor() {
		this.currentState;
		this.signer;
		this.lastCheckpoint;
		this.parentHash; //참조하는 이전 블록 중 부모 블록을 의미함
		this.transactions = [];
	}
}

/**
 * Worker is set environment to commit new block work
 * @param {Address} address
 */

class Worker {
	constructor(address) {
		this.db = new Database();
		this.address = address;
		this.isRunning = false;
		this.blockchain = new Blockchain(this.db, this.address);
		this.env = this.makeCurrent();

		//this.pending
		//this.subscription
	}

	/**
	 * set current environment
	 */

	makeCurrent() {
		const stateDB = new StateDB(this.db);
		const curEnv = new Environment(stateDB);
		curEnv.currentState = stateDB.getStateObject();
		curEnv.signer = curEnv.currentState.address;
		curEnv.lastCheckpoint = this.blockchain.getLastCheckpoint();
		curEnv.previousBlock = this.blockchain.getCurrentBlock();
		curEnv.transactions = []; 

		return curEnv;
	}

	/**
	 * getter: get address
	 */

	get address() {
		return this.address;
	}
}

/**
 * create new worker and listen to the worker's event
 * @param {Address} address
 */

const mainWork = (address) => {
	const worker = new Worker(address);

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
	const transfer = new Transfer();

	//can change
	const p = 100;

	//get transactions
	w.env.transactions = await db.readTxs();

	if (isLocalTxs(w)) {
		//const count = w.env.transactions.length - 1;

		commitNewTransactions(w, w.env.transactions, newTask);

		//fee and all value amount exceed balance
		if (w.env.currentState.getBalance() <= newTask.Amount + newTask.Fee) {
			console.error(`fee and all value amount exceed ${w.address}'s balance`);
		}

		//Add parentHash to previousHash
		newTask.Block.header.previousHash = new Array(2).push(w.env.parentHash.hash());

		//create block
		newTask.Block = transfer.makeBlock();

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

const commitNewTransactions = async (w, transactions, task) => {
	/*TO DO : deafultFee와 한 tx당, block당 value limit을 계산하는 함수 필요 */

	//let defaultFee = 100;

	for (let tx of transactions) {
		//task.Fee = defaultFee;d

		try {
			let result = await txCheck(w, tx, task);

			task.Amount += result;

			task.TxsCache.push(task.Amount);
		} catch (error) {
			console.log("error", error);
		}
	}

	//nonce 없음??
	//task.TxsCache.sort(tx.nonce);

	return task.TxsCache;
};

/**
 * calculate fee and check transaction's value, return the value
 * if the value exceed the limit, the tx is cancled;
 * @param {Worker} w
 * @param {Transaction} tx
 */

const txCheck = (w, tx) => {
	return new Promise((resolve) => {
		const valueLimit = 10000000;
		const fee = calculateFee();
		if (tx.value > valueLimit) {
			console.error("value exceed the limit");
			/*TO DO : cancle tx logic and recommit */
		}
		if (tx.value + fee >= w.env.currentState.getBalance()) {
			console.error(`value + fee exceed the ${w.address}'s balance`);
		}
		resolve(tx.value);
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
	if (w.env.transactions.receiver !== w.address) {
		return true;
	}
};

/**
 *
 * @param {Worker} w
 */

const isRemoteTxs = (w) => {
	if (w.env.transactions.receiver == w.address) {
		return true;
	}
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
