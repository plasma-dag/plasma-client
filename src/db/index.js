// levelDB, DB related APIs...
"use-strict";
const mongo = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";

/**
 * Represent database structure
 */
class Database {
  /**
   * @constructor
   */
  constructor() {
    this.db = mongo;
  }
  writeProof(proof_list) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const proofs = client.db("plasma").collection("proofs");
        proofs
          .updateOne(
            { _id: proof_list[0].proof.blockHeader.hash() },
            { $set: { proof_list } },
            { upsert: true }
          )
          .then(({ result }) => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  readProof(blockNum, receiver) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const proofs = client.db("plasma").collection("proofs");

        proofs
          .find({
            "proof_list.proof.blockHeader.data.accountState.nonce": blockNum
          })
          .project({ proof_list: 1, _id: 0 })
          .toArray()
          .then(result =>
            resolve(
              result[0].proof_list.filter(
                proof => proof.proof.tx.data.receiver === receiver
              )[0]
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
        const users = client.db("plasma").collection("users");
        users
          .updateOne({ _id: user.addr }, { $set: user }, { upsert: true })
          .then(({ result }) => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  readUserbyId(id) {
    return new Promise((resolve, reject) => {
      this.db.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
        const users = client.db("plasma").collection("users");

        users
          .findOne({ id: id })
          .then(result => resolve(result))
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
        const users = client.db("plasma").collection("users");
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
        const users = client.db("plasma").collection("users");

        users
          .findOne({ _id: address })
          .then(result => resolve(result))
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
        const checkpoints = client.db("plasma").collection("checkpoints");

        checkpoints
          .find({ address: addr })
          .sort({ operatorNonce: -1 })
          .limit(1)
          .toArray()
          .then(result => resolve(result))
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
        const potentials = client.db("plasma").collection("potentials");
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
        const potentials = client.db("plasma").collection("potentials");
        return potentials
          .find()
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
        const checkpoints = client.db("plasma").collection("checkpoints");
        checkpoints
          .updateOne(
            { _id: checkpoint.blockHash },
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
        const checkpoints = client.db("plasma").collection("checkpoints");
        // TODO: 필터에 signature => address 바꾸는 로직? 사실 함수 자체가 필요없을 수도 있긴 함.
        return checkpoints
          .find({ blockHash })
          .toArray()
          .then(result => resolve(result))
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
        const blocks = client.db("plasma").collection("blocks");
        // TODO: 필터에 signature => address 바꾸는 로직? 사실 함수 자체가 필요없을 수도 있긴 함.
        return blocks
          .find({})
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
        const blocks = client.db("plasma").collection("blocks");
        blocks
          .findOne({ _id: hash })
          .then(result => resolve(result))
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
        block._id = block.hash();
        const blocks = client.db("plasma").collection("blocks");
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
        const transactions = client.db("plasma").collection("transactions");
        transactions
          .findOne({ _id: hash })
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
        tx._id = tx.hash();
        const transactions = client.db("plasma").collection("transactions");
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
        const states = client.db("plasma").collection("states");
        return states
          .find()
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
        const states = client.db("plasma").collection("states");
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
        const states = client.db("plasma").collection("states");
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
