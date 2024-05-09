const mongoose = require('mongoose')

const UserModel = require("../model/userSchema");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { validationResult } = require('express-validator');
const validator = require('validator');
const { sentOtp , transporter } = require('../config/nodeMailer');

// let expire;

// function otpNull(req, res, next) {
//   expire = setTimeout(() => {
//     req.session.otp = null;
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
            res.redirect("/test");
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
  const signuppage = async (req, res) => {
    let data = {
      fullname: "",
      username: "",
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


//   const signuppage = async (req, res) => {
//     try {
//         let data = {
//             fullname: "",
//             username: "",
//             email: "",
//             phone: "",
//             password: "",
//         };
    
//         // Check if req.session and req.session.data exist before accessing data
//         if (req.session && req.session.data) {
//             data = req.session.data;
//         }
    
//         // Render the signup page with error and data
//         res.render("register", {
//             error: req.flash("error"),
//             data,
//         });
//     } catch (error) {
//         // Handle any errors gracefully
//         console.error("Error in signuppage:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };

// sample
// const postRegister = async (req, res, next) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             // If validation fails, return error messages to the client
//             return res.status(400).json({ errors: errors.array() });
//         }

//         let {
//             fullname,
//             email,
//             password,
//             phone,
//             username
//         } = req.body;

//         // Validate phone number
//         // if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
//         //     return res.status(400).json({ error: 'Please enter a valid phone number' });
//         // }

//         // Check if either the email or phone number is already registered
//         const existingUser = await UserModel.findOne({
//             $or: [{
//                     email: email,
//                 },
//                 {
//                     phone: phone,
//                 },
//             ],
//         });

//         if (existingUser) {
//           let errorMessage;
//           if (existingUser.email === email && existingUser.phone == phone) {
//               errorMessage = 'Email and phone number are already registered';
//           } else if (existingUser.email === email) {
//               errorMessage = 'Email is already registered';
//           } else if (existingUser.phone == phone) {
//               errorMessage = 'Phone number is already registered';
//           } else if (existingUser.username === username) {
//               errorMessage = 'Username is already taken';
//           }
      
//           if (errorMessage) {
//               return res.status(400).render('register', { errorMessage, username, email, phone });
//           }
//       }
//       req.session.data = req.body;
//         let passwordHash = await securePassword(password);
//         // Create a new user document
//         const newUser = new UserModel({
//             fullname: fullname,
//             email: email,
//             password: passwordHash,
//             username: username,
//             phone: phone,
//         });

//         // Save the new user document to MongoDB
//         await newUser.save();

//         req.session.userDetails = newUser; // Store user details in session
//         req.session.emailSignup = email;
//         req.session.otp = sentOtp(email);
//         otpNull(req, res, next);
//         res.redirect("/otp");
//         // return res.status(200).render('register',{successMessage:"Registration successful"});
//         // return res.status(400).render('register',{errorMessage:"Email is already registered"});
//     } catch (error) {
//         if (error.code && error.code === 11000) {
//             // If the error is a duplicate key error, return a custom error message to the client
//             return res.status(400).json({ error: 'Username or email is already taken' });
//         }
//         console.error("Error in postRegister:", error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// signupPage post
const postRegister = async (req, res, next) => {
  try {
    let {
      fullname,
      email,
      password,
      phone,
      username
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
      // req.body in string so have to convert existing data to string
      //  else if(existingUser.phone+"" === phone+"") {
      // else if (existingUser.phone == phone) {
      //   req.flash("error", "Phone number is already registered");
      // }

      req.session.data = req.body;
      return res.redirect("/signup");
    } else {
      let passwordHash = await securePassword(password);
      let user = {
        fullname: fullname,
        email: email,
        password: passwordHash,
        username: username,
        phone: phone,
        isVerified: false
      };
      console.log(fullname, email, phone, username)
      req.session.userDetails = user;
      req.session.emailSignup = email;
      req.session.otp = sentOtp(email);
      otpNull(req, res);
      
      res.redirect("/otp");
    }
  } catch (e) {
    console.error(e);
    res.redirect("/signup");
  }
};

// let postVerifyOtp = async (req, res, next) => {
//   let {
//     otp
//   } = req.body;
//   try {
//     if (req.session.otp != null) {
//       if (!isNaN(otp)) {
//         if (otp === req.session.otp) {
//           req.session.userDetails.isVerified = true;
//           //new user datas submiting to database
//           const newUser = new UserModel(req.session.userDetails);
//           await newUser.save();

//           console.log(newUser)
//           req.session.user = req.session.userDetails.email;
//           res.redirect("/login");
//         } else {
//           req.session.otpFalse = true;
//           res.redirect("/otp");
//         }
//       }
//     } else {
//       req.session.otpExpired = true;
//       res.redirect("/otp");
//     }
//   } catch (e) {
//     error(e);
//     res.status(500).json({
//       message: 'Internal Server error'
//     })
//   }
// };

// let postVerifyOtp = async (req, res, next) => {
//   try {
//     const { otp } = req.body;
    
//     if (req.session.otp != null) {
//       if (!isNaN(otp)) {
//         if (otp === req.session.otp) {
//           // Update isVerified to true
//           req.session.userDetails.isVerified = true;
          
//           // Check if OTP has expired
//           if (req.session.otpExpired) {
//             // OTP has expired, redirect back to OTP entry page with a custom message
//             return res.redirect("/otp?expired=true");
//           }
          
//           // Create a new user document and save it to the database
//           const newUser = new UserModel(req.session.userDetails);
//           await newUser.save();
          
//           console.log(newUser);
          
//           // Set user session and redirect to login
//           req.session.user = req.session.userDetails.email;
//           return res.redirect("/login");
//         } else {
//           // Incorrect OTP, redirect back to OTP entry page
//           req.session.otpFalse = true;
//           return res.redirect("/otp");
//         }
//       }
//     } else {
//       // Set OTP expired flag and redirect back to OTP entry page with a custom message
//       req.session.otpExpired = true;
//       return res.redirect("/otp?expired=true");
//     }
//   } catch (e) {
//     // Handle any errors
//     console.error(e);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// };





// let loadOTP = async (req, res) => {
//   try {
//     if (req.session.otpExpired) {
//       req.session.otpExpired = false;
//       res.render("otp", {
//         err: "Otp Expired",
//       });
//     } else if (req.session.otpFalse) {
//       req.session.otpFalse = false;
//       res.render("otp", {
//         err: "Incorrect Otp",
//       });
//     } else {
//       res.render("otp", {
//         err: "",
//       });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };



// let resendOtp = async (req, res) => {
//   clearInterval(expire);
//   req.session.otp = sentOtp(req.session.emailSignup);
//   otpNull(req, res);
//   res.status(200).json({
//     status: true
//   });
// };

// chatgpt
let expire;

function otpNull(req, res, next) {
  setTimeout(() => {
    req.session.otp = null;
    req.session.otpExpired = true; // Set OTP expiration flag
  }, 10000); // 10 seconds in milliseconds
}

let postVerifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    console.log('..........',req.session.otp);
    
    if (req.session.otp !== null) {
      if (!isNaN(otp)) {
        if (otp === req.session.otp) {
          
          // Update isVerified to true
          req.session.userDetails.isVerified = true;
          
          // Create a new user document and save it to the database
          const newUser = new UserModel(req.session.userDetails);
          await newUser.save();
          
          console.log(newUser);
          
          // Set user session and redirect to login
          req.session.user = req.session.userDetails.email;
          return res.redirect("/login");
        } else {
          // Incorrect OTP, redirect back to OTP entry page
          req.session.otpFalse = true;
          return res.redirect("/otp");
        }
      }
    }
    
    // OTP is null or not a number
    // Set OTP expired flag and redirect back to OTP entry page with a custom message
    req.session.otpExpired = true;
    return res.redirect("/otp?expired=true");
    
  } catch (e) {
    // Handle any errors
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

let resendOtp = async (req, res) => {
  // Clear the existing timeout
  clearTimeout(expire);
  
  // Reset OTP and start a new timeout
  req.session.otp = sentOtp(req.session.emailSignup);
  otpNull(req, res);
  
  res.status(200).json({
    status: true
  });
};




module.exports = {
  securePassword,
  loginpage,
  loginpost,
  signuppage,
  postRegister,
  postVerifyOtp,
  loadOTP,
  resendOtp
}