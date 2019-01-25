const etherjs = require("ethereumjs-util");
const Web3 = require("web3");
const MerkleTree = require("merkletreejs");

pubToAddress = function(publicKey) {
  //var addr = etherjs.pubToAddress('0x836b35a026743e823a90a0ee3b91bf615c6a757e2b60b9e1dc1826fd0dd16106f7bc1e8179f665015f43c6c81f39062fc2086ed849625c06e04697698b21855e')
  var addr = etherjs.pubToAddress(publicKey);
  return "0x" + addr.toString("hex");
};

ecrecover = function(msg, signature) {
  var web3 = new Web3();
  return web3.eth.accounts.recover(msg, signature);
};

makeSignature = function(hash, privateKey) {
  var web3 = new Web3();
  return web3.eth.accounts.sign(hash, privateKey);
};

merkle = function(leaves) {
  var tree = new MerkleTree(leaves, SHA256);
  return tree.getRoot();
};

module.exports = {
  pubToAddress,
  ecrecover,
  makeSignature,
  merkle
};
