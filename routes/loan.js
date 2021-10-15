const express = require("express");
const { postLoan, getAllMyLoan, RefundLoan } = require("../controllers/loan");
const { isLogin, isUser, isAdmin } = require("../middleware/auth");
const router = express.Router();

//this route get all loan belong to a specific user
router.get("/user/loan/fetchMyLoan", isLogin, getAllMyLoan);
//this submit  the get loan form
router.post("/user/loan/getLoan", isLogin, postLoan);
//refund my loan
router.post("/user/payLoan/:loanId", isLogin, RefundLoan);

module.exports = router;
