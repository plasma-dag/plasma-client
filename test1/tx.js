const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
mongo.connect(url, {useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.error(err)
      return
    }

    //초기화
    client.db('tx_db').dropDatabase()


    //tx database 생성
    const tx_db = client.db('tx_db')

    //txList (hardcoded)
    txList = [{from : 'POA', prev_bal : 200, after_bal : 150, amount:50, to:'user1'},
              {from : 'POA', prev_bal : 150, after_bal : 120, amount:30, to:'user2'},
              {from : 'POA', prev_bal : 120, after_bal : 80, amount:40, to:'user1'},
              {from : 'POA', prev_bal : 80, after_bal : 20, amount:60, to:'user3'}]
    
    //make POA's tx collection(from, prev_bal, after_bal, amount, to)
    const tx_POA = tx_db.collection('tx_POA')
    tx_POA.insertMany(txList, (err,result) => {})

    // show all tx (POA's tx collection)
    tx_POA.find().toArray((err,items) => {console.log(items)})

    //make tx_user1's tx collection -Todo
    const tx_user1 = tx_db.collection('tx_user1')
    tx_POA.find({to:'user1'}).forEach(
        function(doc, err){
            tx_user1.insertOne(doc, err =>{})
        }
    )

    //show user1's tx
    tx_user1.find().toArray((err,items) => {console.log(items)})

    client.close()

})