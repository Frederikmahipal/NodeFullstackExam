const express = require('express')
const app = express()
const port = 8080
const mysql = require('mysql')
const dotenv = require('dotenv')
const authRouter = require('./routes/authRouter')

dotenv.config()




app.use(authRouter)


app.listen(port)
console.log('app: ' + port)

