const {
  pubToAddress,
  privateKeyToAccount,
  hashMessage,
  ecrecover,
  makeSignature,
  merkle,
  merkleProof,
  verifyMerkle
} = require("../crypto");
const SHA256 = require("crypto-js/sha256");
const ut = require("../common/utils");

const prv =
  "0xc6cbd7d76bc5baca530c875663711b947efa6a86a900a9e8645ce32e5821484e";
console.log(merkle([SHA256("hello"), SHA256("world")]));
console.log(merkle([ut.calculateSHA256("hello"), ut.calculateSHA256("world")]));
console.log(
  verifyMerkle(
    2,
    merkleProof([SHA256("hello"), SHA256("world")], 1),
    SHA256("world"),
    merkle([SHA256("hello"), SHA256("world")])
  )
);
const sig = makeSignature("hello", prv);
console.log(sig);
console.log(hashMessage("hello"));
console.log(ecrecover(hashMessage("hello"), sig.r, sig.s, sig.v));
console.log(privateKeyToAccount(prv));
