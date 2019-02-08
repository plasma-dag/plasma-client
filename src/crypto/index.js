const etherjs = require("ethereumjs-util");
const Web3 = require("web3");
const MerkleTree = require("merkletreejs");

/**
 * generate ethereum address from publicKey
 * @param {string} publicKey key to generate address
 */
function pubToAddress(publicKey) {
  var addr = etherjs.pubToAddress(publicKey);
  return "0x" + addr.toString("hex");
}

/**
 * recovers signer's address from message and signature
 * @param {string} msg raw data
 * @param {string} signature signature to verify
 */
function ecrecover(msg, signature) {
  var web3 = new Web3();
  return web3.eth.accounts.recover(msg, signature);
}

/**
 * generate signature of hash with privateKey
 * @param {string} hash data to sign
 * @param {string} privateKey key to sign with
 */
function makeSignature(hash, privateKey) {
  var web3 = new Web3();
  return web3.eth.accounts.sign(hash, privateKey);
}

/**
 * generate merkle proof from leaves
 * @param {string[]} leaves data to merkle
 */
function merkle(leaves) {
  var tree = new MerkleTree(leaves, SHA256);
  return tree.getRoot();
}

module.exports = {
  pubToAddress,
  ecrecover,
  makeSignature,
  merkle
};
