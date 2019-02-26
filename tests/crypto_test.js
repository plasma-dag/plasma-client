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
const { Header, Block, signBlock } = require("../src/core/block");
const { Transaction } = require("../src/core/transaction");
const { makeProof } = require("../src/core/proof");
const { Checkpoint, signCheckpoint } = require("../src/core/checkpoint");

const prv =
  "0xc6cbd7d76bc5baca530c875663711b947efa6a86a900a9e8645ce32e5821484e";
const addr = privateKeyToAccount(prv);
// console.log(merkle([SHA256("hello")]));
console.log(SHA256("hello"));
console.log(hashMessage({ hello: "hello" }));
console.log(
  merkle([
    hashMessage({ hello: "hello" }),
    hashMessage({ world: "world" }),
    hashMessage({ world: "world2" })
  ])
);
console.log(
  merkleProof(
    [
      hashMessage("hello"),
      hashMessage("world"),
      hashMessage({ world: "world2" })
    ],
    1
  )
);
console.log(
  verifyMerkle(
    3,
    merkleProof(
      [
        hashMessage("hello"),
        hashMessage("world"),
        hashMessage({ world: "world2" })
      ],
      1
    ),
    hashMessage("world"),
    merkle([
      hashMessage("hello"),
      hashMessage("world"),
      hashMessage({ world: "world2" })
    ])
  )
);

const tx1 = new Transaction("A", 1);
const tx2 = new Transaction("B", 1);

let txList = [tx1, tx2];

const header = new Header({
  previousHash: "",
  potentialHashList: [],
  accountState: {
    nonce: 1,
    balance: 1000
  },
  merkleHash: merkle(txList.map(t => t.hash)),
  difficulty: 0,
  timestamp: 0,
  nonce: 0
});

const block = new Block(header, txList);
signBlock(block, prv);
console.log(block);
console.log(hashMessage(header));
console.log(ecrecover(block.hash, block.r, block.s, block.v));
console.log(privateKeyToAccount(prv));

const cp = new Checkpoint(addr, block.hash, 0, block.r, block.s, block.v);

signCheckpoint(cp, prv);

const proofs = makeProof(tx1, block, cp);

console.log(proofs);
console.log(proofs.merkleProof());
