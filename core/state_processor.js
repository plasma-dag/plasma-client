"use strict";

const { BlockValidator } = require("./block_validator");
const { Checkpoint, signCheckpoint } = require("./checkpoint");
const {
  sendStateTransition,
  receiveStateTransition
} = require("./state_transition");
const { deepCopy } = require("./stateObject");



/**
 *
 * @param {Database}    db
 * @param {StateObject} stateObject     block owner's state object
 * @param {PotentialDB} potentialDB     potentialDB object
 * @param {Hash[]}      blockHashList   block's unreceived block hash list
 */
async function receivePotential(db, stateObject, potentialDB, blockHashList) {
  if (stateObject.address != potential.address) {
    return { error: true };
  }
  const owner = stateObject.address;
  const promises = blockHashList.map(hash => db.readBlock(hash));
  const blocks = await Promise.all(promises);

  blocks.forEach(blk => {
    const transactions = blk.transactions;
    transactions
      .filter(tx => tx.receiver === owner)
      .forEach(tx => receiveStateTransition(stateObject, tx));
    potentialDB.receivePotential(blk.hash(), owner);
  });
  return { error: false };
}

/**
 * Operator calls this function to validate block and process txs
 * Returns checkpoint of given block
 *
 * @param {Database}        db
 * @param {StateDB}         stateDB
 * @param {PotentialDB}     potentialDB
 * @param {Blockchain}      bc
 * @param {Block}           block
 * @param {PrivateKey}      prvKey
 * @param {Number}          opNonce
 */
const operatorStateProcess = (
  db,
  stateDB,
  potentialDB,
  bc,
  block,
  prvKey,
  opNonce
) => {
  /**
   * Before this function call,
   * 1. Check block owner's address
   * 2. Find blockchain for the address
   * ==================================
   * 3. Make BlockValidator for the blockchain, validate block
   * 4. If block is valid, insert the block into the blockchain
   * 5. If block is valid, process receiving potential through potential hash list.
   * 6. If block is valid, process txs and change global states
   * 7. If no error occurred, make signature and checkpoint.
   * TODO: State object의 카피본으로 모든 과정 진행하고 마지막에 rollback 할지
   * 변동사항 쓸지 결정해서 이를 setState 방식으로 저장하도록 바꾸기
   */
  // 3
  const blockValidator = new BlockValidator(db, bc, potentialDB);
  const result = blockValidator.validateBlock(block);
  if (result.error) return result;
  // 4
  bc.insertBlock(block);
  // 5
  const blockOwnerAddress = bc.address;
  const blockHash = block.hash();
  let blockOwnerState = stateDB.getStateObject(blockOwnerAddress);
  // backup
  const prevStateCopy = deepCopy(blockOwnerState); // TODO: deep copy

  if (block.header.potentialHashList.length !== 0) {
    const res = receivePotential(
      db,
      blockOwnerState,
      potentialDB,
      block.header.potentialHashList
    );
    if (res.error) {
      // rollback -> 아마 setState 메소드 좀 바꾸면 더 쉽게 만들 수 있을듯.
      blockOwnerState.setNonce(prevStateCopy.getNonce());
      blockOwnerState.setBalance(prevStateCopy.getBalance());
      return res;
    }
  }
  // 6
  block.transactions.forEach(tx => {
    let receiver = tx.receiver;
    potentialDB.sendPotential(blockHash, receiver);
    const res = sendStateTransition(blockOwnerState, tx);
    if (res.error) {
      // TODO: send error toleration logic here
    }
  });
  // 7
  let checkpoint = new Checkpoint(blockOwnerAddress, blockHash, opNonce);
  const opSigCheckpoint = signCheckpoint(checkpoint, prvKey);
  bc.updateCheckpoint(opSigCheckpoint);
  return opSigCheckpoint;
};

/**
 *
 * @param {*} db
 * @param {*} userState
 * @param {*} potentialDB
 * @param {*} bc
 * @param {*} checkpoint
 * @param {*} opAddr
 */
async function userStateProcess(
  db,
  userState,
  potentialDB,
  bc,
  checkpoint,
  opAddr
) {
  /**
   * 1. Check operator's signature is real usable one and address is user's
   * 2. Find block by checkpoint's block hash
   * 3. Validate target block with current blockchain
   * 3. => 내가 만들고 오퍼레이터가 오케이한건데 내 블록체인과 안 맞는 경우가 있다?
   * 4. If block is valid, insert the block and the checkpoint into the blockchain
   * 5. If block is valid, process receiving potential through potential hash list.
   * 6. If block is valid, process txs and change user's states
   */
  // 1
  if (!checkpoint.validate(opAddr)) return { error: true };
  if (checkpoint.address !== userState.address) return { error: true };
  if (bc.checkpoint.operatorNonce >= checkpoint.operatorNonce)
    return { error: true };
  // 2
  const blockHash = checkpoint.blockHash;
  const targetBlock = await db.readBlock(blockHash);
  if (targetBlock) return { error: true };
  // 3
  const blockValidator = new BlockValidator(db, bc, potentialDB);
  const result = blockValidator.validateBlock(targetBlock);
  if (result.error) return result;
  // 4
  bc.insertBlock(targetBlock);
  bc.updateCheckpoint(checkpoint);
  // 5
  const prevStateCopy = deepCopy(userState); // TODO: deep copy
  if (targetBlock.header.potentialHashList.length !== 0) {
    const res = receivePotential(
      db,
      userState,
      potentialDB,
      targetBlock.header.potentialHashList
    );
    if (res.error) {
      // rollback -> 아마 setState 메소드 좀 바꾸면 더 쉽게 만들 수 있을듯.
      userState.setNonce(prevStateCopy.getNonce());
      userState.setBalance(prevStateCopy.getBalance());
      return res;
    }
  }
  // 6
  targetBlock.transactions.forEach(tx => {
    const res = sendStateTransition(userState, tx);
    if (res.error) {
      // TODO: send error toleration logic here
    }
  });
  return { error: false };
}

module.exports = {
  operatorStateProcess,
  userStateProcess
};
