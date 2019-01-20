// levelDB, DB related APIs...
'use-strict';
const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'

/**
 * Represents the database structure
 */
class Database{ 
    /**
     * @constructor
     */
    constructor() {
        this.db = mongo;
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
        });
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
        });

    }

}

module.exports = {
    Database
};
