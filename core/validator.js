// db에 블록 넘버 겹치는게 이미 있다면 revert 먼저 db에 입력되어있는게 장땡임..(?)
// 블록을 검증해야 비로소 insert할 수 있도록 할 것. longest chain rule을 사용할 수
// 없기 때문에 오퍼레이터의 증명이 필요하다고 생각됨. 오퍼레이터는 한번 서명한 block number
// 값 또는 tx nonce 값을 db에 저장해두고 새로 오는 중복되는 블록에 대해서는 증명을 발급하지
// 않는 방법을 사용.

// 또한 블록이 나와 관련있지 않은 경우에만 저장하는 옵션을 지정해야 함.

// 트랜잭션 밸리데이터도 필요하다. 트랜잭션이 센드일때, 리시브일때에 따라 봐야하는 스테이트 종
// 류가 다름을 인지해야한다.

'use strict';

// operator validation
const validateTransaction = (block, transaction, signature) => {
    let publicKey = getPublicKey(transaction.sender);
    let transactionHash = calculateHash(transaction);
    if(decryptSignature(transactionHash, publicKey) != signature) {
        console.log("transaction signature is invalid.");
        return false;
    }
    /*
    if(transaction.type != SEND_TRANSACTION && transaction.type != RECEIVE_TRANSACTION) {
        console.log("transaction type is invalid.");
        return false;
    }
    */
    if(block.state.address != transaction.sender && block.state.address != transaction.recipient) {
        console.log("invalid transcation for block state.");
        return false;
    }
    if(transaction.value <= 0) {
        console.log("transaction value is invalid.")
    }
    return true;
}


const validateBlock = (block, signature, publicKey) => {
    let headerHash = calculateHash(block.header);
    if(decryptSignature(headerHash, publicKey) != signature) {
        console.log("signautre is invalid.")
        return false;
    }
    
    /**
     * TODO : verify block header.
     */

    Object.keys(block.transactions).forEach( (key) => {
        if(!validateTransaction(block, block.transactions[key], block.signatures[key])) {
            return false;
        }
    });
    return true;
}

const validateState = stateObject => {

    
}


module.exports = {
    validateBlock,
    validateTransaction
}