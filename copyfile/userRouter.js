const express = require('express')
const router = express.Router()
const user = require('../controller/user-controller')
// const cart = require('../controller/cart-controller')
// const checkout = require('../controller/checkout-controller')
// const wallet = require('../controller/walletController')
const {logSession,isAuthenticated } =  require('../middlewares/auth')
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const randomstring = require('randomstring');
require('dotenv').config()

//user home
// router.get('/',logSession,userRouter.home);

// router.get('/test',(req,res) => {
//     res.render('index')
// });
// router.get('/dashboard',(req,res) => {
//     res.render('index')
// });
router.get('/contact',(req,res) => {
    res.render('contact-us')
});


router.get('/dashboard',user.home);

router.get('/testing',(req,res)=>{
    res.render('test')
});

router.get('/',user.loginpage);

// user login/signup/logout management
router.get('/login',user.loginpage);
router.post('/login',user.loginpost);

router.get('/signup', user.signuppage)
router.post('/signup',user.postRegister)

//OTP routers
router.get('/otp', user.loadOTP)
router.post('/postotp', user.postVerifyOtp)
router.get('/resendOtp',user.resendOtp)

module.exports = router;