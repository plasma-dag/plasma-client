'use strict'
const Database = require( "../db/database" );
const StateDB = require( "./stateDB" );
const StateObject = require( "./stateObject" );
const Checkpoint = require( "./checkpoint" );
const Blockchain = require( "./blockchain" );
const Block = require( "./block" );
const Transaction = require( "./transaction" );
const { userStateProcess, operatorStateProcess }= require( "./state_processor" );
const async = require( "async" );

//saving current work result 
class task {
    constructor () {
        this.newState = new StateDB();
        this.newHeader = new Header();
        this.newTxsCache = [];
        this.createAt = time(); //no definition
    }
}
class environment {
    constructor (stateDB) {
        this.currentState;// = stateDB.getStateObject();
        this.signer;
        this.lastCheckpoint;
        this.parentBlock; //참조하는 이전 블록 중 부모 블록을 의미함 
        this.transactions = []
    }

}

class Worker {
    constructor ( address ) {
        this.db = db;
        this.address = address;
        this.task;
        this.env;

        //this.pending
        //this.subscription
    }

    makeCurrent = () => {
        const stateDB = new StateDB( this.db );
        const curEnv = new environment( stateDB );
        curEnv.currentState = stateDB.getStateObject();
        curEnv.signer = curEnv.currentState.address;
        curEnv.lastCheckpoint = this.blockchain.getLastCheckpoint();
        curEnv.previousBlock = this.blockchain.getCurrentBlock();
        curEnv.transactions = [];

        /* TO DO : 트랜잭션 받아오는 함수 필요 */
        
        return curEnv;
    }
    newWorker = ( address ) => {
        const worker = new Worker( address );
        worker.db = Database();
        const currentEnv = worker.makeCurrent();
    
        currentEnv.currentState;
        currentEnv.lastCheckpoint;
        currentEnv.previousBlock;
    
        worker.env = currentEnv;
    
        const newTask = new task();
    
        newTask.newState;
        newTask.newHeader;
        newTask.newTxsCache;
        newTask.createAt;
       
        worker.task = newTask;

        return worker;
    
        //const unconfirmed = this.getUnconfirmedBlock( address );
        
    }

    async commitNewWork = () => {

        const w = this.newWorker( address );

        w.task.newHeader = getNewHeader(); //no definition
        
        // TODO : time 계산

        // TODO : subscribeEvent    
        
        const header = w.task.header;
    
        header.previousHash = new Array( 2 ).push( w.env.parentBlock.hash() );
        
        // TO DO : localTxs 이면 commitNewTransaction 후에 블럭생성
        
        w.task.newTxsCache = commitNewTransaction( w.env.transactions );
        
        //총 fee < balance 충분한지 사전 확인
        if ( w.env.currentState.getBalance() = < fee) {
            console.log( error.toString() );
        }
    
        // TO DO : remoteTxs이면, blockhash값을

        // w.task.newState.get
        // w.task.createdAt
    }
    
}
    
    async commitNewTransaction (transactions) {
        
        let txCache = []; 

        for ( let tx of transactions ) {
            try {
                
                /* TO DO : 총 value amount랑 fee 계산*/

                let insertResult = await insert( tx );
                txCache.push(insertResult)
            } catch ( error ) {
                console.log('error'+error)
            }
        }

    /* sender의 balance가 transaction 전송 fee + balance 을 위해 충분한지 자체적으로도 확인 */
    
        return txCache;
    }

    isRunning = () =>{
    
    }

    isLocalTx = () => {
        
    }

    updateSnapshot = () => {
        
    }


    setRecommitInteval = () => {

    }

    getUnconfirmedBlock = ( address ) => {
        return
    }

    setCoinbase = () => {
        
    }
}

example = () => {
    commitNewWork();

}