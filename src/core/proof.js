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
  validate() {
    for (value of this.proof) {
      if (!value) return { error: true };
    }

    return { error: false };
  }

  merkleProof() {
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
    return { error: false };
  }
}

/**
 *
 * @param {*} checkpoint
 * @param {*} block
 */
// sender의 증명
function makeProof(checkpoint, block) {
  // 4. merkle tree 생성
  const txs = block.transactions;

  let leaves = [];
  txs.forEach(tx => leaves.push(tx.hash()));
  //const root = merkle(leaves);
  //const deps = leaves.length;

  // 5. 각 tx마다 proof를 생성하여 리스트에 추가
  let proofs = [];
  txs.forEach((tx, index) => {
    let proof = {
      tx: tx,
      merkleProof: merkleProof(leaves, index),
      merkleRoot: block.header.merkleHash,
      merkleDeps: block.transactions.length,
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
