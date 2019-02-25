"use strict";
/**
 * Represents potential structure
 * Potential is an unreceived balance which is to be added.
 */
class Potential {
  /**
   * @constructor
   *
   * @param {Database}  db              Database instance
   * @param {Address}   address         Potential owner's address
   * @param {Hash[]}    blockHashList   Unreceived block hash list
   */
  constructor(db, address, blockHashList) {
    this.db = db;
    this.address = address;
    this.blockHashList = blockHashList;
  }

  async save() {
    return await this.db.writePotential(this.address, this.blockHashList);
  }

  isExist(blockHash) {
    return this.blockHashList.includes(blockHash);
  }

  async insert(blockHash) {
    this.blockHashList.push(blockHash);
    await this.save();
  }

  async remove(blockHash) {
    if (this.blockHashList.includes(blockHash)) {
      this.blockHashList.filter(d => d !== blockHash);
      await this.save();
      return true;
    }
    return Error("No matching blockHash in potential");
  }
}

/**
 * Potential Database
 */
class PotentialDB {
  /**
   * Potential dictionary with address : {addr1: Potential1 , addr2: Potential2 , ...}
   * @param {Database} db
   */
  constructor(db) {
    this.db = db;
    this.potentials = {};
  }
  async populate() {
    const res = await this.db.readAllPotentials();
    for (let i = 0; i < res.length; i++) {
      this.potentials[res[i].address] = new Potential(
        this.db,
        res[i].address,
        res[i].hashList ? res[i].hashList : []
      );
    }
  }
  /**
   * Checks if there exists a potential that contains a specific blockHash and a receiver, and returns Boolean
   * @param {Hash} blockHash
   * @param {address} receiver
   */
  isExist(blockHash, receiver) {
    if (this.potentials[receiver]) {
      return this.potentials[receiver].isExist(blockHash);
    }
    return false;
  }
  async makeNewPotential(addr) {
    const newPotential = new Potential(this.db, addr, []);
    this.potentials[addr] = newPotential;
    await newPotential.save();
    return newPotential;
  }
  /**
   * Adds a new potential in potentials dictionary
   * @param {Hash} blockHash
   * @param {address} receiver
   */
  async sendPotential(blockHash, receiver) {
    // Potential already exist
    if (this.potentials[receiver]) {
      return await this.potentials[receiver].insert(blockHash);
    }
    // make new Potential for receiver
    this.potentials[receiver] = new Potential(this.db, receiver, [blockHash]);
    return await this.potentials[receiver].save();
  }
  /**
   * Removes a potential from potentials dictionary, in case the potential is to be added to balance
   * @param {Hash} blockHash
   * @param {address} receiver
   */
  async receivePotential(blockHash, receiver) {
    // Available potential is exist
    if (this.potentials[receiver]) {
      return await this.potentials[receiver].remove(blockHash);
    }
    return Error("No Potentials for receiver address");
  }
}
/**
 * Returns potential's unreceived block hash list
 *
 * @param {Potential} potential
 */
function getHashList(potential) {
  return Array.prototype.slice.call(potential.blockHashList);
}

module.exports = {
  Potential,
  PotentialDB,
  getHashList
};
