'use-strict';
const { calculateHash } = require('../common/utils');
const { makeSignature } = require('../crypto');

class Checkpoint{
    /**
     * @constructor
     * 
     * @param {Address} address
     * @param {Hash}    blockHash
     * @param {Number}  operatorNonce
     */
    constructor(address, blockHash, operatorNonce){
        this.address        = address;
        this.blockHash      = blockHash;
        this.operatorNonce  = operatorNonce;
    }

    hash() {
        if (this.opHash) return this.opHash;
        this.opHash = calculateHash({
            address: this.address,
            blockHash: this.blockHash,
            operatorNonce: this.operatorNonce,
        });
        return this.opHash;
    }
    
    withSignature(signer, sig) {
        const { r, s, v, error } = signer.signatureValues(sig);
        if (error) { return error; }
        this.r = r;
        this.s = s;
        this.v = v;
        return;
    }

    validate(opAddr) {
        // Return true or false, like the code below
        // return decodeWithPubKey(opPubkey, hash(blockHash, operatorNonce));
    }
}

/**
 * 
 */
function signCheckpoint(cp, s, prv) {
    let h = cp.hash();
    let { sig, error } = makeSignature(h, prv);
    if (error) return error;
    return cp.withSignature(s, sig);
}

module.exports = {
    Checkpoint,
    signCheckpoint
};
