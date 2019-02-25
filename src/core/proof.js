"use-strict";

const {
  merkleProof,
  verifyMerkle,
  ecrecover,
  hashMessage
} = require("../crypto");

class Proof {
  /**
   *
   * @param {Transaction}          tx
   * @param {{Position, String}[]} merkleProof
   * @param {Buffer}               merkleRoot
   * @param {Number}               merkleDeps
   * @param {Checkpoint}           checkpoint
   * @param {Header}               blockHeader
   */
  constructor(
    tx,
    merkleProof,
    merkleRoot,
    merkleDeps,
    checkpoint,
    blockHeader,
    r,
    s,
    v
  ) {
    this.data = {
      tx,
      merkleProof,
      merkleRoot,
      merkleDeps,
      checkpoint,
      blockHeader,
      r,
      s,
      v
    };
  }

  // operator가 한사람에게 보낼 때는 하나의 tx로 처리하도록 했는지 검증해서 이상하면 수정안 보내줌
  // receiver는 block, checkpoint, tx, proof validate
  // receiver가 state tranisition하는거 블록 생성 단계 miner에서 호출
  // sender로부터 potential, state 캐싱된 데이터 db update만 하면됨.

  // receiver의 검증
  // proofList = receiver가 지금까지 검증한 proof의 리스트
  validate() {
    for (let key in this.data) {
      if (!this.data[key]) return { error: true };
    }

    return { error: false };
  }

  merkleProof() {
    const result = !verifyMerkle(
      this.data.merkleDeps,
      this.data.merkleProof,
      this.data.tx.hash,
      this.data.merkleRoot
    );
    return {
      error: result
    };
  }

  get sender() {
    if (this.from) return this.from;
    this.from = ecrecover(
      hashMessage(this.data.blockHeader.data),
      this.data.r,
      this.data.s,
      this.data.v
    );
    return this.from;
  }
  get checkpoint() {
    return this.data.checkpoint;
  }
  get blockHash() {
    return this.data.blockHeader.hash;
  }
  get tx() {
    return this.data.tx;
  }
  get blockHeader() {
    return this.data.blockHeader;
  }
}

/**
 * Returns Proof object with given transaction, block, checkpoint
 *
 * @param {*} tx
 * @param {*} blk
 * @param {*} cp
 */
function makeProof(tx, blk, cp) {
  const txs = blk.transactions;

  let leaves = txs.map(tx => tx.txHash);

  const index = txs.findIndex(t => t === tx);
  console.log("tx index: ", index);
  if (index === -1) return { error: "Invalid target tx" };

  return new Proof(
    tx,
    merkleProof(leaves, index),
    blk.merkleHash,
    blk.transactions.length,
    cp,
    blk.header,
    blk.r,
    blk.s,
    blk.v
  );
}

module.exports = {
  Proof,
  makeProof
};
