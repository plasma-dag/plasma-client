const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
mongo.connect(url, {useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.error(err)
      return
    }

    //초기화
    client.db('user_db').dropDatabase()


    //user database 생성
    const user_db = client.db('user_db')

    //userList (hardcoded)
    userList = [{name : 'POA', balance : 100},
                {name : 'user1', balance : 0}, 
                {name : 'user2', balance : 0},
                {name : 'user3', balance : 0}]
    
    //make user's collection(name : String, balance : float)
    userList.map((user) => {
    const lv = user_db.collection(user.name)
    lv.insertOne({name : user.name , balance : user.balance}, (err,result) => {})
    })

    // show each collection and its documents
    userList.map((user) => {
        const lv = user_db.collection(user.name)
        lv.find().toArray((err,items) => {console.log(items)})
    })

    client.close()

})