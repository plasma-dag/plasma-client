const mongo = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";

mongo.connect(url, { useNewUrlParser: true }, (err, client) => {
  client.db("3000").dropDatabase(function(err, result) {
    console.log("Error : " + err);
    if (err) throw err;
    console.log("Operation Success ? " + result);
    // after all the operations with db, close it.
    client.close();
  });
});
mongo.connect(url + "/3001", { useNewUrlParser: true }, (err, client) => {
  client.db("3001").dropDatabase(function(err, result) {
    console.log("Error : " + err);
    if (err) throw err;
    console.log("Operation Success ? " + result);
    // after all the operations with db, close it.
    client.close();
  });
});
mongo.connect(url + "/3002", { useNewUrlParser: true }, (err, client) => {
  client.db("3002").dropDatabase(function(err, result) {
    console.log("Error : " + err);
    if (err) throw err;
    console.log("Operation Success ? " + result);
    // after all the operations with db, close it.
    client.close();
  });
});
mongo.connect(url + "/3003", { useNewUrlParser: true }, (err, client) => {
  client.db("3003").dropDatabase(function(err, result) {
    console.log("Error : " + err);
    if (err) throw err;
    console.log("Operation Success ? " + result);
    // after all the operations with db, close it.
    client.close();
  });
});
