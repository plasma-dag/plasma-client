"use strict";

const ut = require("../common/utils");
const { Database } = require("../db");
/**
 * Represents the Blockchain structure
 */
class Blockchain {
  /**
   * @constructor
   *
   * @param {Database} db         block db
   * @param {Address} address     this blockchain's owner
   */
  constructor(db, address) {
    this.db = db;
    this.address = address;

    /**
     * init() returns a promise of 'this', assigns values to
     * this.checkpoint - list of checkpoint : [last checkpoint]
     * this.blocks - list of blocks : [block n, block n-1, .... block 2, block 1]
     * this.genesisBlock
     * this.currentBlock
     */
    return this.init();
  }

  /**
   *  makes Promise List [last checkpoint, blocks, genesisBlock, currentBlock]
   */

  async init() {
    const result = await Promise.all([
      this.loadLastCheckpoint(),
      this.makeBlockChain()
    ]);
    this.checkpoint = result[0];
    this.blocks = result[1];
    this.genesisBlock = this.blocks[this.blocks.length - 1];
    this.currentBlock = this.blocks[0];
    return this;
  }

  /**
   * final checkpoint got receipt from operator
   * gets address and returns a "list" which contains the lat checkpoint
   */
  async loadLastCheckpoint() {
    let r = await this.db.loadLastCheckpoint(this.address);
    // console.log("checkpoint : ")
    return r;
  }

  /**
   * Before validation
   * Injects a new head block into the current block chain. This method
   * assumes that the block is indeed a true head.
   *
   * @param {Block} block
   */
  insertBlock(block) {
    this.db.writeBlock(block);
    this.currentBlock = block;
    this.blocks.unshift(block);
  }

  /**
   * Updates a new checkpoint received from operator
   *
   * @param {Object} checkpoint
   */
  updateCheckpoint(checkpoint) {
    this.db.writeCheckpoint(checkpoint);
    this.checkpoint.push(checkpoint);
  }

  /**
   * Returns the block matching hash value or number.
   * 나중에 header chain 집어 넣었을 때 필요.
   *
   * @param {String} hash
   * @param {Number} number
   */
  // getBlock(hash, number) {
  //   if (this.blockCache[hash]) return this.blockCache[hash];
  //   if (!this.blocks[number]) {
  //     return null;
  //   }
  //   this.blockCache[hash] = block;
  //   return block;
  // }

  /**
   * gets hash and returns block object
   * db.readblock(hash)가 있는데 필요한가??
   * @param {String} hash
   */
  getBlockByHash(hash) {
    this.db.readBlock(hash).then(res => {
      return res;
    });
  }

  /**
   * Returns the block with block number
   *
   * @param {Number} number
   */
  getBlockByNumber(number) {
    return this.blocks[this.blocks.length - number]
      ? this.blocks[number]
      : null;
  }

  /**
   * Returns current block of this blockchain
   */
  getCurrentBlock() {
    return this.currentBlock;
  }

  //Gets all blocks by address and returns Promise object

  async makeBlockChain() {
    // load last checkpoint by this.address and throw the checkpoint object to last_checkpoint
    let blockList = this.db
      .loadLastCheckpoint(this.address)
      .then(last_checkpoint => {
        // Gets blockhash of the last_checkpoint
        const lastBlockHash = last_checkpoint[0].blockHash;

        // Gets block object by blockHash and throw the block object to lastBlock
        let a = this.db.readBlock(lastBlockHash).then(lastBlock => {
          // Gets block nonce of the last finalized block and store it in lastBlockNonce
          const lastBlockNonce = lastBlock.header.data.accountState.nonce;

          // Gets all the blocks related to this.address and throw the list to allBlockList
          let b = this.db
            .loadBlockswithAddress(this.address)
            .then(allBlockList => {
              // Filter allBlockList by fetching only blocks of which nonce value is smaller than lastBlockNonce
              const filteredList = allBlockList.filter(
                block => block.header.data.accountState.nonce <= lastBlockNonce
              );

              // Move the filtered list items to dictionary,
              // key : (String) block hash & value : (Object) block object
              let filteredDict = {};
              filteredList.map(
                block => (filteredDict[block.blockHash] = block)
              );

              // To ensure if blocks in the filteredList are all linked to each other by previousHash,
              // make a new blockList , and initialize : put last finalized Block
              let blockList = [];
              blockList.push(lastBlock);

              //check one by one, given that if a block is not the genesis block, it has its previous block
              let count = 0;
              while (
                //genesis has previousHash of ""
                blockList[blockList.length - 1].header.data.previousHash !== ""
              ) {
                //check if previousHash does exist
                if (
                  !(
                    blockList[blockList.length - 1].header.data.previousHash in
                    filteredDict
                  )
                ) {
                  console.log(
                    "invalid blockchain : previous block does not exist, blockhash : ",
                    blockList[blockList.length - 1].hash()
                  );
                  break;
                }
                //check if there is a loop
                if (count > blockList.length) {
                  console.log("invalid blockchain : chain has a loop");
                  break;
                }
                //if there is no error push the valid block into the blockList
                blockList.push(
                  filteredDict[
                    blockList[blockList.length - 1].header.data.previousHash
                  ]
                );
                ++count;
              }
              return blockList;
            });

          return b;
        });
        return a;
      });
    return blockList;
  }
}

/**
 *
 * TODO: 이 아래에 있는 function 들은 제 위치로 이동이 필요함.
 */
// get new block
// blockData can be anything; transactions, strings, values, etc.
// function generateNextBlock(blockData) {
//     const previousBlock = getLatestBlock();
//     const difficulty = getDifficulty(getBlockchain());
//     const nextIndex = previousBlock.index + 1;
//     const nextTimestamp = Math.round(new Date().getTime() / 1000);
//     const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);

//     return newBlock;
// }

// function findBlock(nextIndex, previoushash, nextTimestamp, blockData, difficulty) {
//     var nonce = 0;
//     while (true) {
//         var hash = calculateHash(nextIndex, previoushash, nextTimestamp, blockData, difficulty, nonce);
//         if (hashMatchesDifficulty(hash, difficulty)) {
//             return new Block(nextIndex, previoushash, nextTimestamp, blockData, hash, difficulty, nonce);
//         }
//         nonce++;
//     }
// }

// // PoW
// const BLOCK_GENERATION_INTERVAL = 10;  //in seconds
// const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;  //in blocks

// function getDifficulty(aBlockchain) {
//     const latestBlock = aBlockchain[blockchain.length - 1];
//     if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
//         return getAdjustedDifficulty(latestBlock, aBlockchain);
//     }
//     else {
//         return latestBlock.difficulty;
//     }
// }

// function getAdjustedDifficulty(latestBlock, aBlockchain) {
//     const prevAdjustmentBlock = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
//     const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
//     const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;

//     if (timeTaken < timeExpected / 2) {
//         return prevAdjustmentBlock.difficulty + 1;
//     }
//     else if (timeTaken > timeExpected * 2) {
//         return prevAdjustmentBlock.difficulty - 1;
//     }
//     else {
//         return prevAdjustmentBlock.difficulty;
//     }
// }

// function hashMatchesDifficulty(hash, difficulty) {
//     const hashBinary = ut.hexToBinary(hash);
//     const requiredPrefix = '0'.repeat(difficulty);
//     return hashBinary.startsWith(requiredPrefix);
// }

// // get hash
// function calculateHashForBlock(block) {
//     return calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);
// }

// function calculateHash(index, previousHash, timestamp, data, difficulty, nonce) {
//     return ut.calculateHash(index + previousHash + timestamp + data + difficulty + nonce);
// }

// // add new block
// // need validation test
// function addBlock(newBlock) {
//     if (isValidNewBlock(newBlock, getLatestBlock())) {
//         blockchain.push(newBlock);
//         return true;
//     }
//     return false;
// }

// // validation test of new block
// function isValidNewBlock(newBlock, previousBlock) {
//     if (previousBlock.index + 1 !== newBlock.index) {
//         console.log("Invalid index");
//         return false;
//     }
//     else if (previousBlock.hash !== newBlock.previousHash) {
//         console.log("Invalid previoushash");
//         return false;
//     }
//     else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
//         console.log(typeof (newBlock.hash) + " " + typeof calculateHashForBlock(newBlock));
//         console.log("Invalid hash: " + calculateHashForBlock(newBlock) + " " + newBlock.hash);
//         return false;
//     }
//     return true;
// }

// // validation test of blockchain
// function isValidChain(blockchainToValidate) {
//     if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
//         return false;
//     }
//     var tempBlocks = [blockchainToValidate[0]];
//     for (var i = 1; i < blockchainToValidate.length; i++) {
//         if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
//             tempBlocks.push(blockchainToValidate[i]);
//         }
//         else {
//             return false;
//         }
//     }
//     return true;
// }

// // WARNING!! you can modify the following implementaion according to your own consensus design.
// // current consensus: the longest chain rule.
// function replaceChain(newBlocks) {
//     if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
//         const nw = require("./network");

//         console.log("Received blockchain is valid. Replacing current blockchain with received blockchain");
//         blockchain = newBlocks;
//         nw.broadcast(nw.responseLatestMsg());
//     } else {
//         console.log("Received blockchain invalid");
//     }
// }

module.exports = {
  Blockchain
  // generateNextBlock,
  // getLatestBlock,
  // getBlockchain,
  // addBlock,
  // replaceChain
};
