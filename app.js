const express = require('express')
const app = express();
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
}, (error) => {
    if (error) {
        throw error
    }
    console.log('connected')
})

//middleware
app.use(expressLayouts);
app.set('view engine', 'ejs');

//routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

const port = process.env.port || 8080;

app.listen(port, console.log(`Server on port ${port}`))
