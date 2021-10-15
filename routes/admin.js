const express = require("express");
const {
  getGrantor,
  grantLoan,
  getAllLoan,
  getAllUser,
} = require("../controllers/admin");
const { isLogin, isAdmin } = require("../middleware/auth");
const router = express.Router();

//fetch all user
router.get("/user/allUser", getAllUser);
//fetch all loan
router.get("/user/loan/fetchAllLoan", isLogin, getAllLoan);
//get a specific grantor profile
router.get("/admin/grantor/fetchGrantorProfile/:email", isLogin, getGrantor);
//grant loan
router.post(
  "/admin/user/grantLoan/:userId/:loanId/:amount/:status",
  isLogin,
  grantLoan
);
module.exports = router;
