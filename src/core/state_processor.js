"use strict";

const { BlockValidator } = require("./block_validator");
const { Checkpoint, signCheckpoint } = require("./checkpoint");
const {
  sendStateTransition,
  receiveStateTransition
} = require("./state_transition");
const { deepCopy } = require("../common/utils");



/**
 *
 * @param {Database}    db
 * @param {StateObject} stateObject     block owner's state object
 * @param {Potential}   potential       potential object
 * @param {Hash[]}      blockHashList   block's unreceived block hash list
 */
// contract block process
async function receivePotential(db, stateObject, potential, blockHashList) {
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
    //potentialDB.receivePotential(blk.hash(), owner);
    potential.remove(blk.hash());
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
  // const blockValidator = new BlockValidator(db, bc, potentialDB);
  // const result = blockValidator.validateBlock(block);
  // if (result.error) return result;
  // 4
  bc.insertBlock(block);
  // 5
  //const blockOwnerAddress = bc.address;
  const blockOwner = block.header.state.address;
  const blockHash = block.hash();
  let blockOwnerState = stateDB.getStateObject(blockOwner);
  // backup
  const stateCopy = deepCopy(blockOwnerState);
  const potential = potentialDB.potentials[blockOwner];
  const potentialCopy = deepCopy(potential);

  if (block.header.potentialHashList.length !== 0) {
    const res = receivePotential(
      db,
      stateCopy,
      //potentialDB,
      potentialCopy,
      block.header.potentialHashList 
    );
    if (res.error) {
      // rollback -> 아마 setState 메소드 좀 바꾸면 더 쉽게 만들 수 있을듯.
      // blockOwnerState.setNonce(prevStateCopy.getNonce());
      // blockOwnerState.setBalance(prevStateCopy.getBalance());
      return res;
    }
  }
  // 6
  block.transactions.forEach(tx => {
    let receiver = tx.receiver;
    potentialDB.sendPotential(blockHash, receiver);
    const res = sendStateTransition(stateCopy, tx);
    if (res.error) {
      // TODO: send error toleration logic here
    }
  });
  // 7
  let checkpoint = new Checkpoint(blockOwner, blockHash, opNonce);
  const opSigCheckpoint = signCheckpoint(checkpoint, prvKey);
  bc.updateCheckpoint(opSigCheckpoint);

  stateDB.setState(stateCopy.address, stateCopy.account);
  potentialDB.update(potentialCopy); // TODO
  return opSigCheckpoint;
};

/**
 * 
 * @param {*} db 
 * @param {*} userState 
 * @param {*} potential 
 * @param {*} bc 
 * @param {*} checkpoint 
 * @param {*} targetBlock 
 */
function userStateProcess(
  db,
  userState,
  potential,
  bc,
  checkpoint,
  targetBlock
) {
  /**
   * 1. Check operator's signature is real usable one and address is user's (confirmSend 함수에서 처리하도록 수정)
   * 2. Find block by checkpoint's block hash (confirmSend 함수에서 처리하도록 수정)
   * 3. Validate target block with current blockchain (외부에서 처리)
   * 3. => 내가 만들고 오퍼레이터가 오케이한건데 내 블록체인과 안 맞는 경우가 있다?
   * 4. If block is valid, insert the block and the checkpoint into the blockchain
   * 5. If block is valid, process receiving potential through potential hash list.
   * 6. If block is valid, process txs and change user's states
   */
  // 1

  // if (!checkpoint.validate(opAddr)) return { error: true };
  // if (checkpoint.address !== userState.address) return { error: true };
  // if (bc.checkpoint.operatorNonce >= checkpoint.operatorNonce)
  //   return { error: true };

  // transfer.js에 validateCheckpoint() 함수에 포함
  // if (!checkpoint.validate(opAddr)) return { error: true };
  // if (checkpoint.address !== userState.address) return { error: true };
  // if (
  //   bc.checkpoint[bc.checkpoint.length - 1].operatorNonce >=
  //   checkpoint.operatorNonce
  // )
  //   return { error: true };

  // 2
  // const blockHash = checkpoint.blockHash;
  // const targetBlock = await db.readBlock(blockHash);
  // if (targetBlock) return { error: true };
  // 3
  // const blockValidator = new BlockValidator(db, bc, potentialDB);
  // const result = blockValidator.validateBlock(targetBlock);
  // if (result.error) return result;
  // 4
  bc.insertBlock(targetBlock);
  bc.updateCheckpoint(checkpoint);
  // 5
  const stateCopy = deepCopy(userState); 
  const potentialCopy = deepCopy(potential);
  if (targetBlock.header.potentialHashList.length !== 0) {
    const res = receivePotential(
      db,
      stateCopy,
      potentialCopy,
      targetBlock.header.potentialHashList
    );
    if (res.error) {
    //   // rollback -> 아마 setState 메소드 좀 바꾸면 더 쉽게 만들 수 있을듯.
    //   userState.setNonce(prevStateCopy.getNonce());
    //   userState.setBalance(prevStateCopy.getBalance());
      return res;
    }
  }
  // 6
  targetBlock.transactions.forEach(tx => {
    const res = sendStateTransition(stateCopy, tx);
    if (res.error) {
      // TODO: send error toleration logic here
    }
  });

  setState(userState, stateCopy.address, stateCopy.account);
  potential.update(potentialCopy); // TODO
  return { error: false };
}

module.exports = {
  operatorStateProcess,
  userStateProcess
};
