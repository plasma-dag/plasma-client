'use-strict';

class Checkpoint{
    /**
     * @constructor
     * 
     * @param {Hash}    blockHash
     * @param {String}  address
     * @param {Number}  operatorNonce
     * @param {String}  operatorSig
     */
    constructor ( blockHash, address, operatorNonce, operatorSig ) {
        this.blockHash      = blockHash;
        this.address        = address;
        this.operatorNonce  = operatorNonce;
        this.operatorSig    = operatorSig;
    }

    validate(opPubkey) {
        // Return true or false, like the code below
        // return decodeWithPubKey(opPubkey, hash(blockHash, operatorNonce));
    }

}
/** 
 * blockhash 없이 checkpoint 만으로 validate 가능?
 * 
 */
function validate_checkpoint(checkpoint, publickey){
       

}

module.exports={
    Checkpoint
};
