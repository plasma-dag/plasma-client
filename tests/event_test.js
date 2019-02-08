const events = require("events");
const em = new events.EventEmitter();
const mainWork = require("../src/miner/worker").mainWork;

//module.exports.commonEmitter = em;

const exTxs = [];
/*
exTxs.push({ receiver: "0xaa", value: 10 });
let a = "0x00";
let b = exTxs[0].receiver;
let v = exTxs[0].value;
em.addListener("transfer", () => console.log(`${a} transfer ${v} PETH to ${b}`));
em.emit("transfer");

exTxs.push({ receiver: "0xbb", value: 100 });
b = exTxs[1].receiver;
v = exTxs[1].value;
em.emit("transfer");
*/

em.on("mainWork", () => console.log(`mainWork start`));
em.emit("mainWork");
exports.emitter = em;
