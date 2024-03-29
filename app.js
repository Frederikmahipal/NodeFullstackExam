const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const app = express();
const server = require('http').Server(app);
const io = require('./socket')(server);
const methodOverride = require('method-override')
app.io = io;

const { onlineUsers } = require('./socket')
dotenv.config();

require('./config/passport-config')(passport);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
}, (error) => {
    if (error) {
        throw error
    }
    console.log('connected')
});

app.use(express.json())
app.use(express.urlencoded({ extended: false}));


app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    }));


app.use(methodOverride('_method'))
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_message = req.flash('success_message');
  res.locals.error_message = req.flash('error_message');
  res.locals.error = req.flash('error')
  next();
}); 

app.use((req, res, next) => {
  res.locals.onlineUsers = onlineUsers;
  next();
});



app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/post', require('./routes/posts'));

port = 8080;
server.listen(port, console.log(`Server on port ${port}`));
