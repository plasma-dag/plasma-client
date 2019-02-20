"use strict";

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
    this.lastCheckpoint.push(checkpoint);
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
    return this.blocks[this.blocks.length - number - 1]
      ? this.blocks[this.blocks.length - number - 1]
      : null;
  }

  /**
   * Returns block list of the blockchain
   */
  get blockchain() {
    return this.blocks;
  }

  //Gets all blocks by address and returns Promise object

  async makeBlockChain() {
    // load last checkpoint by this.address and throw the checkpoint object to last_checkpoint
    let blockList = this.db
      .loadLastCheckpoint(this.address)
      .then(last_checkpoint => {
        if (last_checkpoint.length == 0) {
          return [];
        }
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

module.exports = {
  Blockchain
};
