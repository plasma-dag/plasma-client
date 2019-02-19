"use strict";

const sendStateTransition = (stateObject, transaction) => {
  let { account } = stateObject;
  console.log("account", account);
  if (account.balance >= transaction.value) {
    account.balance -= transaction.value;
    return { error: false };
  }
  return { error: "Balance is not enough" };
};
const receiveStateTransition = (stateObject, transaction) => {
  stateObject.addBalance(transaction.value);
};

module.exports = {
  sendStateTransition,
  receiveStateTransition
};
