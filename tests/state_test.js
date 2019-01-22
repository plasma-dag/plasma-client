
const { StateDB } = require("../core/StateDB.js");


function testState() {
    let stateDB = new StateDB(undefined);
    let stateObject = stateDB.createStateObject(1122);

    console.log("objects length: " + Object.keys(stateDB.stateObjects).length);
    console.log(stateObject.address + " " + stateObject.account);
    console.log(stateDB.stateObjects[1122]);
}


testState();