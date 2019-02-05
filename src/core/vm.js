const EventEmitter = require("events").EventEmitter;

class VM extends EventEmitter {
	constructor(opts) {
		super(opts);
		EventEmitter.call(this);
		this.opts = opts;
		this.opts = {
			plasma: opts.plasma ? opts.plasma : "testnet",
			mainchain: opts.mainchain ? opts.mainchain : "byzantium"
		};
		setImmediate(() => this.emit("vm", "PlasmaDAG VM Start", this.opts));
		this.arr = [];
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
