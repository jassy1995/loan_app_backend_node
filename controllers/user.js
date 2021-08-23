const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const keys = require("../config/keys");
require("../config/passport");
const keys = process.env.SECRETKEY;

// Load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

// Load User model
const User = require("../models/user");
let userController = {
  //fetch current user
  getCurrentUser: async (req, res, next) => {
    try {
      let user = await User.findById({ _id: req.params.currentUserId });
      return res.json({ successResponse: user });
    } catch (error) {
      return res.json({ errorResponse: error });
    }
  },

  //register user
  postSignup: async (req, res) => {
    console.log(req.body);
    // Form validation
    const { errors, isValid } = validateRegisterInput(req.body);
    //Check validation
    if (!isValid) {
      return res.status(400).json({ errorResponse: errors });
    }
    const {
      first_name,
      last_name,
      phone,
      states,
      address,
      city,
      email,
      password,
    } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.json({ errorResponse: "email is already taken" });
    } else {
      try {
        let reqUser = {
          first_name,
          last_name,
          city,
          states,
          address,
          email,
          password,
          phone,
        };
        let newUser = new User(reqUser);
        //generate random character
        bcrypt.genSalt(10, async (err, salt) => {
          //hash and concat random character
          bcrypt.hash(newUser.password, salt, async (err, hash) => {
            if (err) throw err;
            //update user password with the hash result before save to database
            newUser.password = hash;
            let saveUser = await newUser.save();
            if (saveUser) {
              res.json({
                successResponse: `${newUser.first_name} ${newUser.last_name} has been saved`,
              });
            } else {
              return res.json({ errorResponse: "network problem" });
            }
          });
        });
      } catch (err) {
        console.log(err);
      }
    }
  },

  //login user
  postLogin: async (req, res) => {
    // Form validation
    const { errors, isValid } = validateLoginInput(req.body);
    // Check validation
    if (!isValid) {
      return res.json({ errorResponse: errors });
    }
    const { email, password } = req.body;
    console.log(req.body);
    let user = await User.findOne({ email });
    if (!user) {
      return res.json({ errorResponse: "email does not found" });
    } else {
      try {
        //check password
        let verifyPassword = await bcrypt.compare(password, user.password);
        if (verifyPassword) {
          // Create JWT Payload
          const payload = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            email: user.email,
          };
          //Sign token // 1 year in seconds
          jwt.sign(
            payload,
            keys,
            {
              expiresIn: 31556926,
            },
            (err, token) => {
              res.json({
                successResponse: "login successful",
                token: "Bearer " + token,
                user: user,
              });
            }
          );
        } else {
          res.json({
            errorResponse: "Incorrect password",
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  },
};
module.exports = userController;
