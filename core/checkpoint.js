'use-strict';

class Checkpoint{
    /**
     * 
     * @param {String} address 
     * @param {String} signedhash 
     */
    constructor(address, signedhash){
        this.address   = address
        this.signedhash = signedhash
    }

}
/** 
 * blockhash 없이 checkpoint 만으로 validate 가능?
 * 
 */
function validate_checkpoint(checkpoint, publickey){
       

}

module.exports={Checkpoint}