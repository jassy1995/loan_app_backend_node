const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("../config/passport");
const keys = process.env.SECRETKEY;
const User = require("../models/user");
const Message = require("../models/admin");
// Load input validation
const validateRegisterInput = require("../validation/user/register");
const validateLoginInput = require("../validation/user/login");

let userController = {
  //register user
  RegisterUser: async (req, res, next) => {
    // Form validation
    const { errors, isValid } = validateRegisterInput(req.body);
    //Check validation
    if (!isValid) {
      return res.json({ errorResponse: errors });
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
      let status = req.body.role ? "admin" : "user";
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
          role: status,
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
              return res.json({
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
  LoginUser: async (req, res, next) => {
    // Form validation
    const { errors, isValid } = validateLoginInput(req.body);
    // Check validation
    if (!isValid) {
      return res.json({ errorResponse: errors });
    }
    let user;
    const { email, password } = req.body;
    if (req.body.role) user = await User.findOne({ email, role: "admin" });

    if (!req.body.role) user = await User.findOne({ email, role: "user" });

    if (!user) return res.json({ errorResponse: "email does not found" });

    try {
      //check password
      let verifyPassword = await bcrypt.compare(password, user.password);
      if (verifyPassword) {
        // Create JWT Payload
        const payload = {
          id: user._id,
          email: user.email,
          role: user.role,
        };
        //Sign token // 1 day(24 hours) in seconds
        let authorizer = jwt.sign(payload, keys, {
          expiresIn: 86400,
        });
        let userDetail = {
          first_name: user.first_name,
          last_name: user.last_name,
          wallet: user.wallet,
          debitWallet: user.debitWallet,
          role: user.role,
          email: user.email,
        };
        if (authorizer) {
          return res.json({
            successResponse: "login successful",
            token: "Bearer " + authorizer,
            user: userDetail,
          });
        }
      } else {
        res.json({
          errorResponse: "Incorrect password",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  getCurrentUser: (req, res, next) => {
    const userId = req.user.id;
    User.findOne(
      { _id: userId },
      { _id: 0, password: 0, __v: 0, address: 0, city: 0, state: 0 }
    )
      .then((user) => {
        if (user) return res.json({ user });
      })
      .catch((err) => console.log(err));
  },
  getMessage: (req, res, next) => {
    Message.find({ userId: req.user.id })
      .then((message) => {
        if (message) return res.json({ messages: message });
      })
      .catch((err) => console.log(err));
  },
  updateMessage: (req, res, next) => {
    Message.find({ userId: req.user.id })
      .then((result) => {
        for (let i = 0; i < result.length; i++) {
          result[i].status = "read";
          result[i].save();
        }
        console.log(result);
      })
      .catch((err) => console.log(err));
  },

  fundMyWallet: (req, res, next) => {
    const { amount } = req.body;
    console.log(req.body);
    let verifyAmount =
      typeof amount === "number" && !isNaN(amount) && isFinite(amount);

    if (verifyAmount) {
      User.findById(req.user.id)
        .then((user) => {
          console.log(user);
          if (!user)
            return res.json({ errorResponse: " Record does not found" });
          else {
            user.wallet = user.wallet + amount;
            let result = user.save();
            if (result) {
              let newUserV = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                wallet: user.wallet,
                debitWallet: user.debitWallet,
              };
              return res.json({
                successResponse: "your wallet has been credited",
                user: newUserV,
              });
            }
          }
        })
        .catch((error) => console.log(error));
    } else {
      return res.json({ errorResponse: "please enter a valid value" });
    }
  },
};
module.exports = userController;
