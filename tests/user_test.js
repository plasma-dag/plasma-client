const { Database } = require("../src/db/index");
const { User } = require("../src/network/user");

const db = new Database();
const user1 = new User("id1", "addr1", "ip1");
const user2 = new User("id2", "addr2", "ip2");

async function wait(promise, prefix) {
  let r = await promise;
  console.log(r);
  return;
}

// wait(db.writeUser(user1))
// wait(db.writeUser(user2))

wait(db.readUserbyId("id1"));
wait(db.readUserbyId("id2"));
