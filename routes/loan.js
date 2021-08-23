const express = require("express");
const loanController = require("../controllers/loan");
const router = express.Router();

//this route get all loan belong to a specific user
router.get("/loan/:clientId", loanController.getAllLoan);
//this submit  the login form
router.post("/loan", loanController.postLoan);
//this submit the refund form
router.post("/loan/:loanId/:userId", loanController.postRefundLoan);

module.exports = router;
