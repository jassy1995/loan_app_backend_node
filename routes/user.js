const express = require("express");
const userController = require("../controllers/user");
const router = express.Router();

//this submit  the login form
router.post("/login", userController.postLogin);
//this submit the sign up form
router.post("/register", userController.postSignup);
//this route get the current user
router.get("/user/:currentUserId", userController.getCurrentUser);

module.exports = router;
