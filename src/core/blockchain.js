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
    /**
     * final checkpoint got receipt from operator
     */
    this.lastCheckpoint = this.loadLastCheckpoint(address);

    this.blocks = this.makeBlockChain();
    if (this.blocks == []) {
      return Error("No Blocks at all.");
    }

    this.genesisBlock = this.getBlockByNumber(0);
    if (this.genesisBlock == []) {
      return Error("No Genesis Block");
    }

    this.currentBlock = this.blocks[this.blocks.length - 1];
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
    this.blocks.push(block);
  }

  /**
   * Updates a new checkpoint received from operator
   *
   * @param {Object} checkpoint
   */
  updateCheckpoint(checkpoint) {
    this.db.writeCheckpoint(checkpoint);
    this.lastCheckpoint.push(checkpoint);
  }

  /**
   * Returns the block matching hash value or number.
   * 나중에 header chain 집어 넣었을 때 필요.
   *
   * @param {String} hash
   * @param {Number} number
   */
  getBlock(hash, number) {
    if (this.blockCache[hash]) return this.blockCache[hash];
    if (!this.blocks[number]) {
      return null;
    }
    this.blockCache[hash] = block;
    return block;
  }

  getBlockByHash(hash) {
    db.readBlock(hash);
    return;
  }

  /**
   * Returns the block with block number
   *
   * @param {Number} number
   */
  getBlockByNumber(number) {
    return this.blocks[number] ? this.blocks[number] : null;
  }

  /**
   * Returns current block of this blockchain
   */
  getCurrentBlock() {
    return this.currentBlock;
  }

  makeBlockChain() {
    const blockHash = this.lastCheckpoint.blockHash;

    const block = getBlockByHash(blockHash);

    // const blockNonce = block.header.accountState.nonce;

    let blockList = this.loadBlockswithAddress(this.address);

    //const blocklist = this.db.

    // generate list of blocks within db.
    // 이 때, operator의 checkpoint들을 이용해서 만들어야 함.
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
