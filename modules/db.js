const MongoClient = require('mongodb').MongoClient
const chalk = require('chalk')

// Connection URL
const url = 'mongodb://localhost:27017'

// Database Name
const dbName = 'windForecast'

let db
let collection

// Use connect method to connect to the server
MongoClient
  .connect(url, { useNewUrlParser: true })
  .then(client => {
    console.log(chalk.green('[MongoDb] Created connection succesfully'))

    db = client.db(dbName)
    collection = db.collection('spots')
  })
  .catch(err => console.error(err))

module.exports = {
  db,
  collection
}
