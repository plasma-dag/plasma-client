"use strict";

const sendStateTransition = (stateObject, transaction) => {
  let { account } = stateObject;
  if (account.balance >= transaction.data.value) {
    stateObject.account.balance -= transaction.data.value;
    return { error: false };
  }
  return { error: "Balance is not enough" };
};
const receiveStateTransition = (stateObject, transaction) => {
  stateObject.account.balance += transaction.data.value;
  return { error: false };
};

module.exports = {
  sendStateTransition,
  receiveStateTransition
};
