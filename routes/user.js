const express = require("express");
const userController = require("../controllers/user");
const { isLogin } = require("../middleware/auth");
const router = express.Router();

//this submit  the login form
router.post("/user/login", userController.LoginUser);
//this submit the sign up form
router.post("/user/register", userController.RegisterUser);
//get current user
router.get("/user/current", isLogin, userController.getCurrentUser);
//get message for user
router.get("/user/message", isLogin, userController.getMessage);
//change message status
router.put("/user/message/update", isLogin, userController.updateMessage);
//fund my wallet
router.post("/user/myWallet", isLogin, userController.fundMyWallet);
module.exports = router;
