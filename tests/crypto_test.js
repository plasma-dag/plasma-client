const {
  pubToAddress,
  privateKeyToAccount,
  hashMessage,
  ecrecover,
  makeSignature,
  merkle,
  merkleProof,
  verifyMerkle
} = require("../src/crypto");
const SHA256 = require("crypto-js/sha256");
const ut = require("../src/common/utils");

const prv =
  "0xc6cbd7d76bc5baca530c875663711b947efa6a86a900a9e8645ce32e5821484e";
console.log(merkle([SHA256("hello"), SHA256("world")]));
console.log(merkle([hashMessage({ hello: "hello" }), hashMessage("world")]));
console.log(
  verifyMerkle(
    2,
    merkleProof([hashMessage("hello"), hashMessage("world")], 1),
    hashMessage("world"),
    merkle([hashMessage("hello"), hashMessage("world")])
  )
);
const sig = makeSignature("hello", prv);
console.log(sig);
console.log(hashMessage("hello"));
console.log(ecrecover(hashMessage("hello"), sig.r, sig.s, sig.v));
console.log(privateKeyToAccount(prv));
