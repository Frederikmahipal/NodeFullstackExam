const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);



dotenv.config();

require('./config/passport-config')(passport);

// Connect to MongoDB
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

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    }));

    let onlineUsers = 0;
    io.on('connection', socket => {
      onlineUsers++;
      io.emit('onlineUsers', onlineUsers);
    
      socket.on('disconnect', () => {
        onlineUsers--;
        io.emit('onlineUsers', onlineUsers);
      });
    });
    

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_message = req.flash('success_message');
  res.locals.error_message = req.flash('error_message');
  res.locals.error = req.flash('error')
  next();
}); 

//routes
app.use('/', require('./routes/index')(server));
app.use('/users', require('./routes/users')(server));
app.use('/post', require('./routes/posts')(server));

port = 8080;
server.listen(port, console.log(`Server on port ${port}`));
