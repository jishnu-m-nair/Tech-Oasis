const mongoose = require('mongoose')
const randomString = require('randomstring');
const UserModel = require("../model/userSchema");
const ProductModel = require("../model/productSchema");
const categoryModel = require("../model/categorySchema");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { validationResult } = require('express-validator');
const validator = require('validator');
const { sentOtp , transporter } = require('../config/nodeMailer');

// let expire;

// function otpNull(req, res, next) {
//   expire = setTimeout(() => {
//     req.session.otp = null;
//     req.session.otpExpired = true;
//   },1000 * 10);
// }
// 1000 * 60 * 3

const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10); // Add await here
      return passwordHash;
    } catch (error) {
      console.log(error.message);
    }
  };

  const home = async (req, res) => {
    try {
  
      let products = await ProductModel.find({}).limit(4);
      let item = await ProductModel.find();
      const category = await categoryModel.find({});

  
      if (req.session.email) {
        let userData = await UserModel.findOne({email: req.session.email})
  
        if (!userData.isBlocked) {
          res.render("index", {
            item,
            products,
            category,
            userEmail: userData.email
          });
        } else {
          req.session.isBlocked = true;
          return res.redirect('/login');
        }
      } else {
        res.render("index", {
          item,
          products,
          category,
          userEmail: null
        })
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        message: "Internal Server Error",
  
      });
  
    }
  };






//login get router
const loginpage = async (req, res) => {
    try {
      let data = {
        email: "",
        password: "",
      };
  
      if (req.session.data) {
        data = req.session.data;
      }
  
      if (req.session.isBlocked) {
        req.session.user = false;
        req.session.isBlocked = false;
        const errorMessage = "Sorry user blocked";
        res.render("login", {
          err: errorMessage,
          data,
        });
      } else if (req.session.passwordIncorrect) {
        req.session.passwordIncorrect = false;
        const errorMessage = "Incorrect Password";
        res.render("login", {
          err: errorMessage,
          data,
        });
      } else if (req.session.noUser) {
        req.session.noUser = false;
        const errorMessage = "Incorrect email or password";
        res.render("login", {
          err: errorMessage,
          data,
        });
      }
      // else if (req.session.user) {
      //   res.redirect("/");
      // } 
      else {
        res.render("login", {
          err: "",
          data,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json("Internal Server Error");
    }
  };
  
  
  
  // login post
  const loginpost = async (req, res) => {
    try {
      const userData = await UserModel.findOne({
        email: req.body.email,
      });
  
      req.session.data = {};
  
      if (userData) {
        const isPassWordValid = await bcrypt.compare(
          req.body.password,
          userData.password
        );
  
        if (isPassWordValid) {
          if (userData.isBlocked) {
            req.session.isBlocked = true;
            req.session.data = req.body;
            res.redirect("/login");
          } else {
            // req.session.data = req.body
            req.session.userDetails = {
              userId: userData._id,
              email: req.body.email,
            };
            req.session.email = req.body.email;
            req.session.userId = userData._id
            res.redirect("/dashboard");
          }
        } else {
          // Password does not match
          req.session.passwordIncorrect = true;
          req.session.data = req.body;
          res.redirect("/login");
        }
      } else {
        // User not found
        req.session.noUser = true;
        req.session.data = req.body;
        res.redirect("/login");
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json("Internal Server error");
    }
  };
  
//   signup get
  let signuppage =  (req, res) => {
    let data = {
      fullname: "",
      email: "",
      phone: "",
      password: "",
    };
  
    if (req.session.data) {
      data = req.session.data;
  
      res.render("register", {
        error: req.flash("error"),
        data,
      });
    } else {
      res.render("register", {
        error: req.flash("error"),
        data,
      });
    }
  };



// signupPage post
const postRegister = async (req, res, next) => {
  try {
    let {
      fullname,
      email,
      password,
      phone
    } = req.body;


    req.session.data = {};
    // Check if either the email or phone number is already registered
    const existingUser = await UserModel.findOne({
      $or: [{
          email: email,
        },
        {
          phone: phone,
        },
      ],
    });

    if (existingUser) {
      if (existingUser.email === email && existingUser.phone == phone) {
        req.flash("error", "Email and phone number is already registered");
      } else if (existingUser.email === email) {
        req.flash("error", "Email is already registered");
      }

      req.session.data = req.body;
      return res.redirect("/signup");
    } else {
      let passwordHash = await securePassword(password);
      let user = {
        fullname: fullname,
        email: email,
        password: passwordHash,
        phone: phone,
        isVerified: false
      };
      console.log(fullname, email, phone)
      console.log(req.body)
      req.session.userDetails = user;
      req.session.emailSignup = email;
      // res.redirect('/testing')
      req.session.otp = sentOtp(email);
      otpNull(req);
      
      res.redirect("/otp");
    }
  } catch (e) {
    console.error(e);
    res.redirect("/signup");
  }
};


let expireOTP;

function otpNull(req, res, next) {
  clearTimeout(expireOTP)
  expireOTP = setTimeout(() => {
    req.session.otp = null;
    req.session.otpExpired = true; // Set OTP expiration flag
    console.log("OTP expired!"); // Add logging for debugging
  }, 10000); // 10 seconds in milliseconds
}


let postVerifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (req.session.otp !== null && !req.session.otpExpired) {
      if (!isNaN(otp)) {
        if (otp === req.session.otp) {
          req.session.userDetails.isVerified = true;
          // const newUser = new UserModel(req.session.userDetails);
          // await newUser.save();
          console.log("user saved");
          req.session.user = req.session.userDetails.email;
          return res.redirect("/login");
        } else {
          req.session.otpFalse = true;
          return res.redirect("/otp");
        }
      }
    } else{
      req.session.otpExpired = true;
    return res.redirect("/otp?expired=true");
    }

    
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};




let loadOTP = async (req, res) => {
  try {
    if (req.session.otpExpired) {
      req.session.otpExpired = false; // Reset OTP expiration flag
      res.render("otp", {
        err: "OTP expired. Please try again.", // Proper error message for OTP expiration
      });
    } else if (req.session.otpFalse) {
      req.session.otpFalse = false;
      res.render("otp", {
        err: "Incorrect OTP",
      });
    } else {
      res.render("otp", {
        err: "",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// let resendOtp = async (req, res) => {
//   // Clear the existing timeout
//   clearTimeout(expire);
  
//   // Reset OTP and start a new timeout
//   req.session.otp = sentOtp(req.session.emailSignup);
//   otpNull(req, res);
  
//   res.status(200).json({
//     status: true
//   });
// };

// Controller method to handle OTP resending
// const resendOtp = async (req, res) => {
//   clearTimeout(expire);

//   const email = req.session.emailSignup;
//   if (!email) {
//     return res.render('otp', { err: 'Email not found. Please login again.' });
//   }

//   req.session.otp = sentOtp(email);
//   otpNull(req);

//   res.status(200).json({ status: true });
// };

const resendOtp = async (req, res) => {
  clearTimeout(expireOTP);

  const email = req.session.emailSignup;
  if (!email) {
    return res.status(400).json({ status: false, message: 'Email not found. Please login again.' });
  }

  req.session.otp = sentOtp(email);
  otpNull(req);

  return res.status(200).json({ status: true, message: 'OTP has been resent successfully!' });
};


module.exports = {
  home,
  securePassword,
  loginpage,
  loginpost,
  signuppage,
  postRegister,
  postVerifyOtp,
  loadOTP,
  resendOtp
}