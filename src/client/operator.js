"use-strict";

const { Blockchain } = require("../core/blockchain");
const { BlockValidator } = require("../core/validator");
const { PotentialDB } = require("../core/potential");
const { operatorStateProcess } = require("../core/state_processor");

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
    this.opNonce = 0;
    this.blockchains = {};
  }

  async init() {
    this.stateDB = new StateDB(this.db);
    this.potentialDB = new PotentialDB(this.db);
    await this.stateDB.populate(); // TODO
    await this.potentialDB.populate();
    this.userList = await this.db.getUserList(); // TODO: user = peer?
    // For each user in userList make their own blockchain instance in
    // this.blockchains
    this.userList.forEach(async user => {
      this.blockchains[user.address] = new Blockchain(db, user.address);
      await this.blockchains[user.address].init();
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
   *
   * @param {*} block
   * @param {*} prvKey
   */
  processBlock(block, prvKey) {
    const validator = new BlockValidator(
      this.db,
      this.blockchains[block.sender()],
      this.potentialDB
    );
    let result = validator.validateBlock(block); // TODO: have to cover validating deposit block(deposit block has no tx)
    if (result.error) return result;
    // block process
    const opSigCheckpoint = operatorStateProcess(
      this.db,
      this.stateDB,
      this.potentialDB,
      this.bc,
      block,
      prvKey,
      this.opNonce
    );
    return opSigCheckpoint;
  }
}

module.exports = {
  Operator
};
