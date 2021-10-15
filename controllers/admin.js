const Loan = require("../models/loan");
const User = require("../models/user");
const Message = require("../models/admin");

let adminController = {
  getAllUser: (req, res, next) => {
    User.find()
      .then((users) => {
        if (users) {
          return res.json({ users });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.json({ message: err });
      });
  },
  getAllLoan: (req, res, next) => {
    Loan.find()
      .populate("userId")
      .then((resp) => {
        return res.json({ allLoans: resp });
      })
      .catch((err) => console.log(err));
  },

  getGrantor: (req, res, next) => {
    let userId;
    User.findOne({ email: req.params.email })
      .then((user) => {
        userId = user._id;
        Loan.find({ userId })
          .populate("userId")
          .then((resp) => {
            return res.json({ grantor: resp });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  },

  grantLoan: (req, res, next) => {
    let { userId, loanId, amount, status } = req.params;
    User.findOne({ _id: userId })
      .then((user) => {
        Loan.findOne({ _id: loanId, userId })
          .then((loan) => {
            User.findOne({ _id: req.user.id })
              .then((newAdmin) => {
                if (
                  loan &&
                  loan.request_status === "pending" &&
                  status === "accept" &&
                  newAdmin.wallet < Number(amount)
                ) {
                  return res.json({
                    errorResponse:
                      "insufficient balance,please fund your wallet",
                  });
                } else if (
                  loan &&
                  loan.request_status === "pending" &&
                  status === "accept" &&
                  newAdmin.wallet >= Number(amount)
                ) {
                  loan.request_status = "approved";
                  loan.payment_status = "pay now";
                  user.wallet = user.wallet + Number(amount);
                  user.debitWallet = user.debitWallet + Number(amount);
                  newAdmin.wallet = newAdmin.wallet - Number(amount);
                  let returnUser = {
                    wallet: newAdmin.wallet,
                    first_name: newAdmin.first_name,
                    last_name: newAdmin.last_name,
                    email: newAdmin.email,
                    role: newAdmin.role,
                    debitWallet: newAdmin.debitWallet,
                  };
                  loan.save();
                  user.save();
                  newAdmin.save();
                  return res.json({
                    successResponse: "approved",
                    user: returnUser,
                  });
                } else if (
                  loan &&
                  loan.request_status === "approved" &&
                  status === "accept"
                ) {
                  return res.json({
                    errorResponse: "you have already approve this loan",
                  });
                } else if (
                  loan &&
                  loan.request_status === "pending" &&
                  status === "decline"
                ) {
                  loan.request_status = "rejected";
                  loan.payment_status = "failed";
                  loan.save();
                  let newMessage = new Message({
                    message:
                      "your loan could not be granted because your grantors are not consistent with their payment,you can fund your wallet so that the case of your grantor can be ignore and grant you the loan",
                    status: "unread",
                    userId,
                  });
                  newMessage.save();
                  return res.json({
                    successResponse: "you have successfully reject this loan",
                  });
                } else if (
                  loan &&
                  loan.request_status === "approved" &&
                  status === "decline"
                ) {
                  return res.json({
                    errorResponse:
                      "you have already approve this loan, so you cannot reject it",
                  });
                } else if (
                  loan &&
                  loan.request_status === "rejected" &&
                  status === "decline"
                ) {
                  return res.json({
                    errorResponse: "you have already reject this loan",
                  });
                } else if (
                  loan &&
                  loan.request_status === "rejected" &&
                  status === "accept"
                ) {
                  return res.json({
                    errorResponse:
                      "you have already reject this loan,so you cannot accept it again",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  },
};
module.exports = adminController;
