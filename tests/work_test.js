const EventEmitter = require("events").EventEmitter;
const mainWork = require("../miner/worker").mainWork;
const Database = require("../db/index");
const test_event = require("../../tests/event_test").emitter;

class VM extends EventEmitter {
	constructor(opts) {
		super(opts);
		EventEmitter.call(this);
		this.opts = opts;
		this.opts = {
			plasma: opts.plasma ? opts.plasma : "testnet",
			mainchain: opts.mainchain ? opts.mainchain : "byzantium",
			db: opts.db ? opts.db : Database.db,
			address: opts.address ? opts.address : "0x00"
		};
		setImmediate(() => this.emit("vm", "PlasmaDAG VM Start", this.opts));
	}
}

VM.prototype.worker = require("../miner/worker");
VM.prototype.miner = require("../miner/miner");

const exOpts = {
	plasma: "test",
	mainchain: "ethereum"
};

const vm = new VM(exOpts);
vm.on("vm", (str, opts) => console.log(str, opts));

//test_event.on("transfer", mainWork(vm.opts));

test_event.emit("mainWork", mainWork(vm.opts));
