'use-strict';
const { Block, Header } = require('../core/block');
const { Checkpoint } = require('../core/checkpoint')
const { Database } = require('./database');

let checkpoint = new Checkpoint(
    "a10fd9das0125aqw2",
    "qjwj45jv9s081n39f7s623bd8cn28"

)

const db = new Database();

// db.writeCheckpoint(checkpoint)
// .then(res => console.log(res))
// .catch(err => console.log(err));

async function checkpoint_test(promise) {
    let a = await promise;
    console.log(a);
    return;
  }
// checkpoint_test(db.writeCheckpoint(checkpoint))
checkpoint_test(db.loadCheckpoint(checkpoint.address))
// db.loadCheckpoint(checkpoint.address)
// .then(res => console.log(res))
// .catch(err => consol:e.log(err));

// db.readState(newState.getAddress)
// .then(res => console.log(res))
// .catch(err => console.log(err));