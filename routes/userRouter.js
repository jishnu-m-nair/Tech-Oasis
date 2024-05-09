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

router.get('/test',(req,res) => {
    res.render('index')
})



// user login/signup/logout management
router.get('/login',user.loginpage);
router.post('/login',user.loginpost);

// router.get('/verify-otp',(req,res)=>{
//     res.render('otp')
// })

// router.get('/send-otp',(req,res)=>{
//     res.render('otpmail')
// })

router.get('/signup', user.signuppage)
router.post('/signup',user.postRegister)

//OTP routers
router.get('/otp', user.loadOTP)
router.post('/postotp', user.postVerifyOtp)
router.get('/resendOtp',user.resendOtp)

module.exports = router;