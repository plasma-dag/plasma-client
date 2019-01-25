class Signer {
    /**
     * 
     * @param {Uint8Array} sig 
     */
    signatureValues(sig){
        if (sig.length !== 65) return { error: Error('Wrong size for signature: should be 65, got ' + sig.length)};
        let r = numberToBytes(sig.slice(0, 32)),
            s = numberToBytes(sig.slice(32, 64)),
            v = numberToBytes(sig[64] + 27);
        return { r, s, v };
    }
    /**
     * 
     * @param {Block} block 
     */
    sender(block) {
        if (!block.from) {
            block.from = recoverPlain(block.hash(), 
                                      block.r, 
                                      block.s, 
                                      block.v);
        }
        return block.from;
    }
}

/**
 * 
 * @param {Block}       block 
 * @param {Signer}      s 
 * @param {PrivateKey}  prv 
 */
function signBlock(block, s, prv) {
    let h = block.hash();
    let { sig, error } = crypto.sign(h, prv);
    if (error) return error;
    return block.withSignature(s, sig);
}

function recoverPlain(sigHash, R, S, V) {
    // TODO: input parameter validation
    const r = numberToBytes(R);
    const s = numberToBytes(S);

    let sig = new Uint8Array(65);
    for (let i=0; i<32; i++) {
        sig[i] = r[i];
    }
    for (let i=32; i<64; i++) {
        sig[i] = s[i-32];
    }
    sig[64] = numberToBytes(V - 27);

    const pub = crypto.Ecrecover(sigHash, sig);
    // TODO: pub key validation
    return crypto.makeAddress(pub);
}

module.exports = {
    Signer,
    signBlock
};
