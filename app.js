const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
// const flash = require('connect-flash'); 
const logger = require('morgan');
const path = require('path');
require('dotenv').config;


const app = express();

// importing database
const connectdb = require('./config/dbconnect');
connectdb();

// Logger
app.use(logger('dev'));

// Use express-flash middleware


// Use express-session middleware
app.use(session({
    secret: 'secret', // Replace with your secret key
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// setting view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

// static pathing
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'public','uploads')));
//Use body parsing middlewares before session middleware
app.use(express.json());
app.use(express.urlencoded({
   extended: true
}));

// sample routing
// app.get('/',(req,res) => {
//     res.render('login');
// })

// app.get('/register',(req,res) => {
//    res.render('register');
// })

// Middleware to pass flashed messages to views
// app.use((req, res, next) => {
//    res.locals.messages = req.flash();
//    next();
//  });

//Routes
const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter')

app.use('/', userRouter)
app.use('/', adminRouter)





const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
   console.log(`Server started on http://localhost:${PORT}`)
})