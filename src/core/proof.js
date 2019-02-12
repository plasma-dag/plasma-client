"use-strict";

const { merkle, merkleProof, verifyMerkle } = require("../crypto/index.js");
const validateCheckpoint = require("../core/validator");
const userStateProcess = require("../core/state_processor");

class Proof {
  /**
   *
   * @param {*} tx
   * @param {*} merkleProof
   * @param {*} merkleRoot
   * @param {*} merkleDeps
   * @param {*} checkpoint
   * @param {*} blockHeader
   */
  constructor(
    tx,
    merkleProof,
    merkleRoot,
    merkleDeps,
    checkpoint,
    blockHeader
  ) {
    this.proof = {
      tx,
      merkleProof,
      merkleRoot,
      merkleDeps,
      checkpoint,
      blockHeader
    };
  }

  // operator가 한사람에게 보낼 때는 하나의 tx로 처리하도록 했는지 검증해서 이상하면 수정안 보내줌
  // receiver는 block, checkpoint, tx, proof validate
  // receiver가 state tranisition하는거 블록 생성 단계 miner에서 호출
  // sender로부터 potential, state 캐싱된 데이터 db update만 하면됨.

  // receiver의 검증
  // proofList = receiver가 지금까지 검증한 proof의 리스트
  /**
   *
   * @param {*} proofList
   * @param {*} potentialDB
   * @param {*} opAddr
   */
  validate(proofList, potentialDB, opAddr) {
    // checkpoint 검증
    let result = validateCheckpoint(
      this.proof.blockHeader.accountState.address,
      this.proof.checkpoint,
      this.proof.blockHeader.hash(),
      opAddr
    );
    if (result.error) return { error: true };

    // 이미 전에 추가된 증명인지 확인
    result = proofList.find(proof => {
      proof.blockHeader.hash() === this.proof.blockHeader.hash();
    });
    if (result) return { error: true };

    // 머클 증명을 통한 tx 포함 여부 확인
    if (
      !verifyMerkle(
        this.merkleDeps,
        this.merkleProof,
        this.tx.hash(),
        this.merkleRoot
      )
    )
      return { error: true };

    // receive potential
    potentialDB.sendPotential(
      this.proof.blockHeader.hash(),
      this.proof.tx.receiver
    );
    proofList.push(this.proof);
    return { error: false };
  }
}

// sender의 증명
/**
 *
 * @param {*} checkpoint
 * @param {*} pendingBlock
 * @param {*} db
 * @param {*} stateDB
 * @param {*} potentialDB
 * @param {*} bc
 * @param {*} opAddr
 */
async function makeProof(
  checkpoint,
  pendingBlock,
  db,
  stateDB,
  potentialDB,
  bc,
  opAddr
) {
  const sender = checkpoint.address;
  if (!sender) return { error: true };

  const block = pendingBlock;
  if (!block) return { error: true };

  // 1.checkpoint 검증
  let result = validateCheckpoint(
    sender,
    checkpoint,
    block.header.hash(),
    opAddr
  );
  if (result.error) return { error: true };
  if (
    bc.checkpoint[bc.checkpoint.length - 1].operatorNonce >=
    checkpoint.operatorNonce
  )
    return { error: true };
  // // 2. 블록 read(db에서 읽지 않고 miner pending block에서 가져옴)
  // const block = await db.readBlock(checkpoint.blockHash);
  // if (!block) return { error: true };

  // 3. validate block(블록을 만드는 단계에서 검증하기)
  // result = blockValidator.validateBlock(block);
  // if (result.error) return { error: true };

  // state transition
  result = userStateProcess(db, stateDB, potentialDB, bc, checkpoint, block);
  if (result.error) return { error: true };

  // 4. merkle tree 생성
  const txs = block.transactions;
  let leaves = [];
  txs.forEach(tx => leaves.push(tx.hash()));
  const root = merkle(leaves);
  const deps = leaves.length;

  // 5. 각 tx마다 proof를 생성하여 리스트에 추가
  let proofs = [];
  txs.forEach((tx, index) => {
    let proof = {
      tx: tx,
      merkleProof: merkleProof(leaves, index),
      merkleRoot: root,
      merkleDeps: deps,
      checkpoint: checkpoint,
      blockHeader: block.header
    };
    proofs.push(new Proof(proof));
  });
  return proofs;
}

module.exports = {
  Proof,
  makeProof
};
