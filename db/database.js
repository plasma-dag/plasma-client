// levelDB, DB related APIs...
'use-strict';
const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'

/**
 * Represent database structure
 */
class Database{ 
    /**
     * @constructor
     */
    constructor() {
        this.db = mongo;
    }
    
    /**
     * write one potential hash for address
     * @param {*} address 
     * @param {*} hash 
     */
    writePotential(address, hash) {

    }

    /**
     * read all potentials for address
     * @param {*} address 
     */
    readAllPotentials(address) {
        
    }

    /**
     * find one potential hash
     * @param {*} hash 
     */
    findPotential(hash) {

    }

    /**
     * remove one potential hash
     * @param {*} hash 
     */
    removePotential(hash) {

    }

    /**
     * update checkpoint
     * 
     * @param {*} checkpoint 
     * @param {Number} account
     */
    writeCheckpoint(checkpoint, address) {
        
    }
    /**
     * return checkpoint
     */
    readCheckpoint(address) {

    }

    /**
     * return blocklist for address
     */
    loadBlockswithAddress() {
        return new Promise((resolve, reject) => {
            this.db.connect(url, {useNewUrlParser: true }, (err, client) => {
                if (err) {
                    console.error(err)
                    return
                }
                const blocks = client.db('plasma').collection('blocks')

                return blocks.find().toArray()
                    .then((result) => resolve(result))
                    .catch(err => reject(err))
                }
            )
        }) 
    }

    /**
     * Gets hash value of a block from DB, and Returns Promise object, 
     * @param {String} hash 
     */  
    readBlock(hash) {
        return new Promise((resolve, reject) => {
            this.db.connect(url, {useNewUrlParser: true }, (err, client) => {
                if (err) {
                    console.error(err)
                    return
                }
                const blocks = client.db('plasma').collection('blocks')

                blocks.findOne({_id : hash})
                    .then((result) => resolve(result) )
                    .catch(err => reject(err))
                }
            )
        })

    }
    
    /**
     * Get a Block object and write it on DB, Returns Promise object
     * @param {Block} block 
     */   
    writeBlock(block) {
        return new Promise((resolve, reject) => {
            this.db.connect(url, {useNewUrlParser: true }, (err, client) => {
                if (err) {
                  console.error(err)
                  return
                }
                block._id = block.hash();

                const blocks = client.db('plasma').collection('blocks')
                
                blocks.insertOne(block)
                    .then(({result}) => resolve(result))
                    .catch(err => reject(err));
                }
            )
        })
    }

    /**
     * Gets hash value of tx, Returns Promise objects from DB
     * @param {String} hash 
     */
    readTx(hash){

        return new Promise((resolve, reject) => {
            this.db.connect(url, {useNewUrlParser: true }, (err, client) => {
                if (err) {
                    console.error(err)
                    return
                }
                const transactions = client.db('plasma').collection('transactions')

                transactions.findOne({_id : hash})
                    .then((result) => resolve(result) )
                    .catch(err => reject(err))
                }
            )
        })
    }

    /**
     * Get a Transaction object and write it on DB, Returns Promise an object.
     * @param {Transaction} tx 
     */
    writeTx(tx){

        return new Promise((resolve, reject) => {
            this.db.connect(url, {useNewUrlParser: true }, (err, client) => {
                if (err) {
                  console.error(err)
                  return
                }
                tx._id = tx.hash();

                const transactions = client.db('plasma').collection('transactions')
                
                transactions.insertOne(tx)
                    .then(({result}) => resolve(result))
                    .catch(err => reject(err));
                }
            )
        })

    }
    /**
    * Gets a State Object, Returns Promise objects from DB
    * @param {String} address 
    */
    readState(address) {
        return new Promise((resolve, reject) => {
            this.db.connect(url, {useNewUrlParser: true }, (err, client) => {
                if (err) {
                    console.error(err)
                    return
                }
                const states = client.db('plasma').collection('states')

                states.findOne({_id : address})
                    .then((result) => resolve(result) )
                    .catch(err => reject(err))
            }
            )
        })

    }

    /**
    * Get a State object and update it on DB, Returns Promise an object.
    * @param {Object} state 
    */
    writeState(state){
        return new Promise((resolve,reject)=>{
            this.db.connect(url, {useNewUrlParser: true}, (err, client) => {
                if (err) {
                    console.error(err)
                    return
                }
                
                const states = client.db('plasma').collection('states')

                state._id = state.address;
            
                states.updateOne(state._id,state,{upsert:true})
                    .then(({result})=>resolve(result))
                    .catch((err => reject(err)));
                }
            )
        })

    }
 }

module.exports = {
    Database
};
