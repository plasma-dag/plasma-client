"use strict";
const Database = require("../db/index");
const StateDB = require("./stateDB");
const StateObject = require("./stateObject");
const Blockchain = require("./blockchain");
const {userStateProcess, operatorStateProcess} = require("./state_processor");
const Transfer = require("./transfer");

// TO DO : change to Big Integer


/**
 * 
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
}
/**
 * 
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
 *      
 * @param {Address} address
 */
class Worker {

    constructor(address) {
		this.db = new Database();
		this.address = address;
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
		curEnv.transactions = []; //transfer.makeTransaction(receiver,value);

		return curEnv;
	}

	/**
	 * return an indicator whether worker is running or not
	 */

	isRunning(address) {}

	/**
	 * getter: get address
	 */

	get address() {
		return this.address;
	}
}

/**
 * generate several new sealing tasks based on the parent block
 * @package {Worker} w
 */
const commitNewWork = async (w) => {
	const newTask = new Task();
	const transfer = new Transfer();
    
    //can change
    const p = 100;

	//get transactions
	w.env.transactions = transfer.makeTransaction();

	if (isLocalTxs(w)) {
        
        
        //const count = w.env.transactions.length - 1;

		commitNewTransactions(w,w.env.transactions, newTask);

        //fee and all value amount exceed balance
        if (w.env.currentState.getBalance() <= newTask.Amount + newTask.Fee) {
            console.error(`fee and all value amount exceed ${w.address}'s balance`)
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
 * @params {Worker} w
 *         {Transactions} txs
 *         {Task} task
 */
const commitNewTransactions = async (w,txs, task) => {
    let result;
    
/*TO DO : deafultFee와 한 tx당, block당 value limit을 계산하는 함수 필요 */
    
    let defaultFee = 100;
    
    const valueLimit = 10000000;

	for (let tx of transactions) {
        
        task.Fee = defaultFee;

        try {
			result = await txCheck(w, tx, task);

            task.Amount += tx.value;         
            
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
 * @param {Transaction} tx 
 * @param {Task} task 
 */
const txCheck = (w,tx,task) => {
    
    task.Fee = calculateFee(); 

    if (tx.value > valueLimit) {
        console.error("value exceed the limit");
        /*TO DO : cancle tx logic and recommit */
    }
    if ( tx.value + task.Fee >= w.env.currentState.getBalance() ){
        console.error(`value + fee exceed the ${w.address}'s balance`);
    }
    
    return tx.value;
}

const calculateFee = () => {

    //TO DO : How to calculate tx's fee or block's fee
}

const mining = (block) => {

    //TO DO: get difficulty and calcultate nonce;
    
       

};

//TO DO : ethereum frontier 일부 참고했으나 difficulty가 value에 비례하도록 수정 필요.

/**
 * 
 * @param {*} time 
 * @param {*} prentBlock 
 */
const CalcDifficulty = (block, prentBlock) => {
    
    let diff = 0;
    let expDiff = 0;
    const adjust = parrentblock.difficulty / 2048  //2048 is difficultyBoundDivisor
    const time = block.header.timestamp;
    const parentTime = parentBlock.header.timestamp;
    const parentDiff = parentBlock.header.difficulty;
    const minimumDiff = 131072;
    const durationLimit = 13;

    if ((time - parentIime) < (durationLimit)) {
        expDiff = parentDiff + adjust;
    } else {
        expDiff = prentDiff - adjust;
    } 
        
    if (expDiff > minimumDiff) {
        diff = minimumDiff;
    } else
        diff = expDiff;

    return diff;
}

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

const setRecommitInteval = () => {};

const getUnconfirmedBlock = (address) => {
	return;
};

/**
 * 
 * @param {Address} address
 */
const mainWork = (address) => {
	const worker = new Worker(address);

    if (!worker.isRunning()) {
        commitNewWork(worker);
    }

    /*TO DO : receiver가 되는 transaction을 event로 받음 */
    ImReceiver() {
        if (!worker.isRunning) {
            console.error(`${address}'s worker is not running`);
        }    
        if(isRemoteTxs(worker)) {
            //blockhash값을 previousBlock에 추가
            worker.env.Block.hash.previousBlock.push(remoteBlockhash);
        }
    }
 

};
