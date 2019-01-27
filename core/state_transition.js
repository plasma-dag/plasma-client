'use strict';

const sendStateTransition = (stateObject, transaction) => {
    stateObject.subBalance(transaction.value);
}
const receiveStateTransition = (stateObject, transaction) => {
    stateObject.addBalance(transaction.value);
}

module.exports = {
    sendStateTransition,
    receiveStateTransition
}