// levelDB, DB related APIs...
"use-strict";
const mongo = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
// const dbName = process.env.HTTP_PORT || '3001';
/**
 * Represent database structure
 */
class Database {
  /**
   * @constructor
   */
  constructor(dbName = process.env.HTTP_PORT || "3001") {
    this.db = mongo;
    this.dbName = dbName;
  }
  writeProof(proof_list) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const proofs = client.db(this.dbName).collection("proofs");
        proofs
          .updateOne(
            { _id: proof_list[0].proof.blockHeader.hash },
            { $set: { proof_list } },
            { upsert: true }
          )
          .then(({ result }) => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  readProof(blockHash, receiver) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const proofs = client.db(this.dbName).collection("proofs");

        proofs
          .findOne({
            _id: blockHash
          })
          .then(result =>
            resolve(
              result
                ? result.proof_list.find(
                    p => p.proof.tx.data.receiver === receiver
                  )
                : undefined
            )
          )
          .catch(err => reject(err));
      });
    });
  }

  readAllProof() {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const proofs = client.db(this.dbName).collection("proofs");

        proofs
          .find()
          .toArray()
          .then(result =>
            resolve(
              result.reduce((prev, curr) => {
                return prev.concat(curr.proof_list);
              }, [])
            )
          )
          .catch(err => reject(err));
      });
    });
  }

  writeUser(user) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const users = client.db(this.dbName).collection("users");
        users
          .updateOne({ _id: user.addr }, { $set: user }, { upsert: true })
          .then(({ result }) => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  readUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const users = client.db(this.dbName).collection("users");

        users
          .find({ id: id }, { projection: { _id: 0 } })
          .toArray()
          .then(result => resolve(result[0]))
          .catch(err => reject(err));
      });
    });
  }

  getUserList() {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.log(err);
          return;
        }
        const users = client.db(this.dbName).collection("users");
        users
          .find()
          .toArray()
          .then(result => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  readUserbyAddress(address) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const users = client.db(this.dbName).collection("users");

        users
          .find({ _id: address }, { projection: { _id: 0 } })
          .toArray()
          .then(result => resolve(result[0]))
          .catch(err => reject(err));
      });
    });
  }

  loadLastCheckpoint(addr) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const checkpoints = client.db(this.dbName).collection("checkpoints");

        checkpoints
          .find({ address: addr })
          .sort({ operatorNonce: -1 })
          .limit(1)
          .toArray()
          .then(result => resolve(result[0]))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * write potential hash list for address
   *
   * @param {Address} address
   * @param {Hash[]}  hashList
   */
  writePotential(address, hashList) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const potentials = client.db(this.dbName).collection("potentials");
        potentials
          .updateOne(
            { address },
            { $set: { address, hashList } },
            { upsert: true }
          )
          .then(({ result }) => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * read all potentials in database
   */
  readAllPotentials() {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const potentials = client.db(this.dbName).collection("potentials");
        return potentials
          .find({}, { projection: { _id: 0 } })
          .toArray()
          .then(result => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * update checkpoint
   *
   * @param {Checkpoint} checkpoint
   * Gets checkpoint Object and update them on db, and returns a Promise object.
   * todo : blockhash => signed blockhash
   */
  writeCheckpoint(checkpoint) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const checkpoints = client.db(this.dbName).collection("checkpoints");
        checkpoints
          .updateOne(
            { _id: checkpoint.hash },
            { $set: checkpoint },
            { upsert: true }
          )
          .then(({ result }) => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * Gets blockHash and returns matching checkpoints
   * @param {Hash} blockHash
   */
  readCheckpointWithBlockHash(blockHash) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const checkpoints = client.db(this.dbName).collection("checkpoints");
        // TODO: 필터에 signature => address 바꾸는 로직? 사실 함수 자체가 필요없을 수도 있긴 함.
        return checkpoints
          .find({ blockHash }, { projection: { _id: 0 } })
          .toArray()
          .then(result => resolve(result[0]))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * return blocklist for address
   *
   */
  loadBlockswithAddress(address) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const blocks = client.db(this.dbName).collection("blocks");
        // TODO: 필터에 signature => address 바꾸는 로직? 사실 함수 자체가 필요없을 수도 있긴 함.
        return blocks
          .find({}, { projection: { _id: 0 } })
          .toArray()
          .then(result => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * Gets hash value of a block from DB, and Returns Promise object,
   *
   * @param {String} hash
   */

  readBlock(hash) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const blocks = client.db(this.dbName).collection("blocks");
        blocks
          .find({ _id: hash }, { projection: { _id: 0 } })
          .toArray()
          .then(result => resolve(result[0]))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * Get a Block object and write it on DB, Returns Promise object
   * @param {Block} block
   */

  writeBlock(block) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        // Block's hash value is always unique
        block._id = block.hash;
        const blocks = client.db(this.dbName).collection("blocks");
        blocks
          .insertOne(block)
          .then(({ result }) => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * Gets hash value of tx, Returns Promise objects from DB
   *
   * @param {String} hash
   */
  readTx(hash) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const transactions = client.db(this.dbName).collection("transactions");
        transactions
          .find({ _id: hash }, { projection: { _id: 0 } })
          .then(result => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * Get a Transaction object and write it on DB, Returns Promise an object
   *
   * @param {Transaction} tx
   */
  writeTx(tx) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        // Transaciton's hash value is always unique
        tx._id = tx.hash;
        const transactions = client.db(this.dbName).collection("transactions");
        transactions
          .insertOne(tx)
          .then(({ result }) => resolve(result))
          .catch(err => reject(err));
      });
    });
  }
  /**
   * reads all states from db, and then returns them
   */
  readAllStates() {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const states = client.db(this.dbName).collection("states");
        return states
          .find({}, { projection: { _id: 0 } })
          .toArray()
          .then(result => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * Gets a State Object, Returns Promise objects from DB
   *
   * @param {String} address
   */
  readState(address) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const states = client.db(this.dbName).collection("states");
        states
          .findOne({ address: address })
          .then(({ address, account }) => resolve({ address, account }))
          .catch(err => reject(err));
      });
    });
  }

  /**
   * Get a State object and update it on DB, Returns Promise an object.
   *
   * @param {Object} state
   */
  writeState(state) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const states = client.db(this.dbName).collection("states");
        states
          .updateOne(
            { address: state.address },
            { $set: { account: state.account } },
            { upsert: true }
          )
          .then(({ result }) => resolve(result))
          .catch(err => reject(err));
      });
    });
  }
}

module.exports = {
  Database
};
