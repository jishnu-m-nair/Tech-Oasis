const express = require('express');
const session = require('express-session');
const flash = require('connect-flash'); 
const logger = require('morgan');
const path = require('path');
const passport = require('passport');
const createError = require('http-errors');
require('dotenv').config();

const connectdb = require('./config/dbconnect');
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');

// Initialize Express app
const app = express();

// Connect to database
connectdb();

// Logger
app.use(logger('dev'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret', // Use environment variable for the secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Secure cookies in production
}));

// Flash middleware
app.use(flash());

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());
require('./authenticate');

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'uploads')));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route handlers
app.use('/', userRouter);
app.use('/', adminRouter);

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard'); // Redirect to dashboard after successful login
});


// Start server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
