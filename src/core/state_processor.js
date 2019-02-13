"use strict";

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

const stateProcess = function(
  db,
  stateDB,
  potentialDB,
  bc,
  block,
  prvKey,
  opNonce
) {
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

  bc.insertBlock(block);

  // 5
  //const blockOwnerAddress = bc.address;
  const blockOwner = block.header.state.address;
  const blockHash = block.hash();

  //let blockOwnerState = stateDB.getStateObject(blockOwner);

  // backup
  const blockOwnerState = stateDB.stateObjects[blockOwner];
  const stateCopy = deepCopy(blockOwnerState);
  const potential = potentialDB.potentials[blockOwner];
  const potentialCopy = deepCopy(potential);

  if (block.header.potentialHashList.length !== 0) {
    const res = receivePotential(
      db,
      stateCopy,
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

      return res;
    }
  });

  // 7
  let checkpoint = new Checkpoint(blockOwner, blockHash, opNonce);
  const opSigCheckpoint = signCheckpoint(checkpoint, prvKey);
  bc.updateCheckpoint(opSigCheckpoint);

  stateDB.setState(stateCopy.address, stateCopy.account);
  potentialDB.makeNewPotential(potentialCopy.address); // TODO: 지금은 potential처리하고 나면 래퍼런스된 모든 블록을 처리한다고 생각하고 새로 만드는 로직, 하지만 potential 처리시 없는 block hash가 생길 수도 있음.. setPotential() 필요?
  return opSigCheckpoint;
};

/**
 *
 * @param {*} db
 * @param {stateObject} state
 * @param {potentialObject} potential
 * @param {*} block
 */
const preStateProcess = function(db, state, potential, block) {
  /**
   * 1. Check operator's signature is real usable one and address is user's (confirmSend 함수에서 처리하도록 수정)
   * 2. Find block by checkpoint's block hash (confirmSend 함수에서 처리하도록 수정)
   * 3. Validate target block with current blockchain (외부에서 처리)
   * 3. => 내가 만들고 오퍼레이터가 오케이한건데 내 블록체인과 안 맞는 경우가 있다?
   * 4. If block is valid, insert the block and the checkpoint into the blockchain
   * 5. If block is valid, process receiving potential through potential hash list.
   * 6. If block is valid, process txs and change user's states
   */

  // 5 state, potential copy로 potential을 받을 받아서 state copy를 update
  const stateCopy = deepCopy(state);
  const potentialCopy = deepCopy(potential);
  if (targetBlock.header.potentialHashList.length !== 0) {
    const res = receivePotential(
      db,
      stateCopy,
      potentialCopy,
      block.header.potentialHashList
    );
    if (res.error) {
      return res;
    }
  }

  // 6 state copy로 block에 포함된 tx를 처리하여 update
  block.transactions.forEach(tx => {
    const res = sendStateTransition(stateCopy, tx);
    if (res.error) {
      // TODO: send error toleration logic here

      return res;
    }
  });

  // state copy return(원래 state는 그대로 유지)
  return stateCopy;
};

module.exports = {
  stateProcess,
  preStateProcess
};
