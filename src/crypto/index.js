const etherjs = require("ethereumjs-util");
const Web3 = require("web3");
const MerkleTree = require("merkletreejs");
const SHA256 = require("crypto-js/sha256");

const { flatten } = require("../common/utils");

const web3 = new Web3("http://localhost:8545");

/**
 * generate ethereum address from publicKey
 * @param {string} publicKey key to generate address
 */
function pubToAddress(publicKey) {
  let addr = etherjs.pubToAddress(publicKey);
  return "0x" + addr.toString("hex");
}

function privateKeyToAccount(privateKey) {
  return web3.eth.accounts.privateKeyToAccount(privateKey).address;
}

/**
 * Hash message with Keccak256
 *
 * @param {Object} data
 *
 * @returns {String} hex string starts with '0x'
 */
function hashMessage(data) {
  const fd = flatten(data);
  const strData = Object.entries(fd).reduce(
    (prev, curr) => prev + curr[1].toString(),
    ""
  );
  return web3.eth.accounts.hashMessage(strData);
}

/**
 * recovers signer's address from signature object
 *
 * @param {String} messageHash
 * @param {String} r
 * @param {String} s
 * @param {String} v
 */
function ecrecover(messageHash, r, s, v) {
  return web3.eth.accounts.recover({
    messageHash,
    v,
    r,
    s
  });
}

/**
 * generate signature of data with privateKey
 * @param {Object} data data to sign
 * @param {String} privateKey key to sign with
 */
function makeSignature(data, privateKey) {
  const fd = flatten(data);
  const strData = Object.entries(fd).reduce(
    (prev, curr) => prev + curr[1].toString(),
    ""
  );
  return web3.eth.accounts.sign(strData, privateKey);
}

/**
 * Returns calculated SHA256 hash value
 *
 * @param {Object} data
 * @returns {SHA256} SHA256
 */
function calculateSHA256(data) {
  const strData = Object.entries(data).reduce(
    (prev, curr) => prev + curr[1].toString(),
    ""
  );
  return SHA256(strData);
}

/**
 * generate merkle proof from leaves
 * @param {string[]} leaves data to merkle
 */
function merkle(leaves) {
  let tree = new MerkleTree(leaves.map(hash => hash.replace("0x", "")), SHA256);
  return tree.getRoot().toString("hex");
}

function merkleProof(leaves, index) {
  let tree = new MerkleTree(leaves.map(hash => hash.replace("0x", "")), SHA256);
  // return tree.getProof(leaves[index], index);
  const rawProof = tree.getProof(leaves[index], index);
  return rawProof.map(proof => ({
    position: proof.position,
    data: proof.data.toString("hex")
  }));
}

/**
 *
 * @param {*} deps
 * @param {*} proof
 * @param {Hash} target
 * @param {*} root
 */
function verifyMerkle(deps, proof, target, root) {
  let leaves = new Array((arrayLength = deps)).fill(SHA256(0));
  let tree = new MerkleTree(leaves, SHA256);
  const bufProof = proof.map(proof => ({
    position: proof.position,
    data: Buffer.from(proof.data, "hex")
  }));
  return tree.verify(bufProof, target.replace("0x", ""), root);
}
module.exports = {
  pubToAddress,
  privateKeyToAccount,
  hashMessage,
  ecrecover,
  makeSignature,
  calculateSHA256,
  merkle,
  merkleProof,
  verifyMerkle
};
