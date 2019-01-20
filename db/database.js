// levelDB, DB related APIs...
'use-strict';
const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'

/**
 * 
 */
class Database{ 
    constructor() {
        this.db = mongo;

    }
    
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

    

    





}

module.exports = {
    Database
};
