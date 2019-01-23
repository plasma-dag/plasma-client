const { Block, Header } = require("./block");

let hd = new Header("ddfkdfdk", null, "dfdfdfdfd", 0, 1, 1532315, 123, null);

let blk = new Block(hd, "sig", []);

console.log(hd.hash());
console.log(hd);
console.log(blk.hash());
console.log(blk);
