'use strict';

const sendStateTransition = (stateObject, transaction) => {
    const res = stateObject.subBalance(transaction.value);
    return res.error ? res : { error: false };
}
const receiveStateTransition = (stateObject, transaction) => {
    stateObject.addBalance(transaction.value);
}

module.exports = {
    sendStateTransition,
    receiveStateTransition
}