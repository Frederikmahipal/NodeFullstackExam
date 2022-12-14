const express = require('express')
const app = express()
const port = 8080
const mysql = require('mysql')
const dotenv = require('dotenv')

dotenv.config()

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sildsild1"
  });

  db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  })

  

app.get('/', (req, res) => {
  res.send('ayo')
})

app.listen(port)
console.log('app: ' + port)