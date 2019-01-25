const etherjs = require("ethereumjs-util");
const Web3 = require("web3");
const MerkleTree = require("merkletreejs");

function pubToAddress(publicKey) {
  var addr = etherjs.pubToAddress(publicKey);
  return "0x" + addr.toString("hex");
}

function ecrecover(msg, signature) {
  var web3 = new Web3();
  return web3.eth.accounts.recover(msg, signature);
}

function makeSignature(hash, privateKey) {
  var web3 = new Web3();
  return web3.eth.accounts.sign(hash, privateKey);
}

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
