const User = require("../models/user");
const Loan = require("../models/loan");

exports.postLoan = (req, res, next) => {
  const { title, first_grantor, second_grantor, amount } = req.body;
  if (
    !req.body.title ||
    !req.body.first_grantor ||
    !req.body.second_grantor ||
    !req.body.amount
  ) {
    return res.json({ errorResponse: "please fill all the field correctly" });
  } else {
    let totalAmount;
    User.find({ email: { $in: [first_grantor, second_grantor] } })
      .then((val) => {
        if (val.length !== 2 || val.length === 0) {
          return res.json({
            errorResponse: "your grantor record does not exist",
          });
        } else {
          totalAmount = val[0].wallet + val[1].wallet;
          User.findById(req.user.id)
            .then((user) => {
              if (!user) {
                return res.json({
                  errorResponse: "your record does not exist",
                });
              } else if (
                user.email === first_grantor ||
                user.email === second_grantor
              ) {
                return res.json({
                  errorResponse: "you cannot use your own email",
                });
              } else if (
                user.wallet === 0 &&
                totalAmount < Number(amount) &&
                Number(amount) > 50000
              ) {
                return res.json({
                  errorResponse: "the minimum amount you can get is 50,000",
                });
              } else if (
                user.wallet > 0 &&
                totalAmount > 0 &&
                user.wallet + totalAmount < Number(amount)
              ) {
                return res.json({
                  errorResponse: "Denied! please enter a less amount",
                });
              } else {
                let isPreviousLoan = false;
                let isPendingLoan = false;
                Loan.find({ userId: req.user.id })
                  .then((loan) => {
                    for (let i = 0; i < loan.length; i++) {
                      if (loan && loan[i].payment_status === "pay now") {
                        isPreviousLoan = true;
                      } else if (loan && loan[i].payment_status === "pending") {
                        isPendingLoan = true;
                      }
                    }
                    if (isPreviousLoan) {
                      return res.json({
                        errorResponse:
                          "Denied! please first pay your previous loan",
                      });
                    } else if (isPendingLoan) {
                      return res.json({
                        errorResponse:
                          "Denied! You already have a pending  loan request",
                      });
                    } else {
                      let amountToNumber = Number(amount);
                      let refundAmount = 0.1 * amountToNumber + amountToNumber;
                      let latePayment = 0.2 * amountToNumber + amountToNumber;
                      let d = new Date();
                      let deuDate = new Date(d.setMonth(d.getMonth() + 6));
                      const newUserLoan = new Loan({
                        title,
                        first_grantor,
                        second_grantor,
                        refundAmount,
                        latePayment,
                        deuDate,
                        request_status: "pending",
                        payment_status: "pending",
                        userId: user._id,
                      });
                      newUserLoan
                        .save()
                        .then((userLoan) => {
                          return res.json({
                            successResponse: "you request has been received",
                            user: userLoan,
                          });
                        })
                        .catch((err) => {
                          console.log(err);
                        });
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => console.log(err));
  }
};

exports.getAllMyLoan = (req, res, next) => {
  const userId = req.user.id;
  Loan.find({ userId }, { userId: 0 })
    .then((resp) => {
      return res.json({ loans: resp });
    })
    .catch((err) => console.log(err));
};

exports.RefundLoan = (req, res, next) => {
  const { amount } = req.body;
  const { loanId } = req.params;

  User.findById(req.user.id)
    .then((user) => {
      if (user.wallet < Number(amount)) {
        return res.json({
          Response: "insufficient fund,please fund your wallet",
        });
      } else {
        user.wallet = user.wallet - Number(amount);
        user.debitWallet = user.debitWallet - Number(amount);
        user
          .save()
          .then((r) => {
            Loan.findById(loanId).then((loan) => {
              if (loan.request_status === "approved") {
                if (loan.payment_status === "paid") {
                  return res.json({
                    Response: "already paid for this loan",
                  });
                } else if (loan.payment_status === "failed") {
                  return res.json({
                    Response:
                      "This loan does not granted,so you can't refund it",
                  });
                } else if (
                  loan.refundAmount < Number(req.body.amount) &&
                  loan.payment_status === "pay now"
                ) {
                  return res.json({
                    Response: "please enter appropriate amount",
                  });
                } else if (
                  loan.refundAmount > Number(req.body.amount) &&
                  loan.payment_status === "pay now"
                ) {
                  loan.refundAmount =
                    loan.refundAmount - Number(req.body.amount);
                  loan.save();
                  return res.json({
                    Response: "payment successful",
                    user,
                  });
                } else if (
                  loan.refundAmount === Number(req.body.amount) &&
                  loan.payment_status === "pay now"
                ) {
                  loan.refundAmount =
                    loan.refundAmount - Number(req.body.amount);
                  loan.payment_status = "paid";
                  loan.refundAmount = loan.latePayment / 1.2;
                  loan.save();

                  return res.json({
                    Response: "payment successful",
                    user,
                  });
                }
              } else if (loan.request_status === "pending") {
                return res.json({
                  Response: "this loan is still pending,please wait",
                });
              } else if (loan.request_status === "rejected") {
                return res.json({
                  Response: "this loan does not granted",
                });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};
