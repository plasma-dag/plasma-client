"use-strict";

const { Blockchain } = require("../core/blockchain");
const { BlockValidator } = require("../core/validator");
const { PotentialDB } = require("../core/potential");
const { StateDB } = require("../core/state");
const { stateProcess } = require("../core/state_processor");

/**
 * This class manages the information of plasma network and methods
 * required by plasma operator
 *
 */
class Operator {
  /**
   *
   * @param {*} db
   */
  constructor(db, opNonce = 0) {
    this.db = db;
    this._opNonce = opNonce;
    this._blockchains = {};
  }

  async init() {
    this.stateDB = new StateDB(this.db);
    this.potentialDB = new PotentialDB(this.db);
    await this.stateDB.populate();
    await this.potentialDB.populate();
    this.userList = await this.db.getUserList(); // TODO: user = peer?
    // For each user in userList make their own blockchain instance in
    // this.blockchains
    this.userList.forEach(async user => {
      let blkchain = new Blockchain(this.db, user.addr);
      await blkchain.init();
      this.blockchains[user.addr] = blkchain;
      let lastOpNonce = blkchain.lastOpNonce;
      this._opNonce = Math.max(lastOpNonce, this._opNonce);
    });
  }

  // deposit phase 1
  deposit(value, contractBlock) {
    const result = this.blockValidator.validateContractBlock(contractBlock); // TODO
    if (result.error) return result;
    this.potentialDB.sendPotential(value, contractBlock.state.address);
    return { error: false };
  }
  /**
   * If operator receives block, this function validates it and make checkpoint
   * and state transition.
   *
   * @param {*} block
   * @param {*} prvKey
   */
  async processBlock(block, prvKey) {
    const validator = new BlockValidator(
      this.db,
      this.blockchains[block.sender],
      this.potentialDB
    );
    let result = await validator.validateBlock(block); // TODO: have to cover validating deposit block(deposit block has no tx)
    if (result.error) return result;
    console.log("validation OK!");
    console.log(result);
    // block process
    const opSigCheckpoint = stateProcess(
      this.db,
      this.stateDB,
      this.potentialDB,
      this.blockchains[block.sender],
      block,
      prvKey,
      this.opNonce
    );
    if (opSigCheckpoint.error) {
      return { error: opSigCheckpoint.error };
    }
    this.opNonce += 1;
    return opSigCheckpoint;
  }
  get blockchains() {
    return this._blockchains;
  }
  get opNonce() {
    return this._opNonce;
  }
  set opNonce(nonce) {
    this._opNonce = nonce;
  }
}

module.exports = {
  Operator
};
