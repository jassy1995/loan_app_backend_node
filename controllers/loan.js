const User = require("../models/user");
const Loan = require("../models/loan");

exports.postLoan = (req, res, next) => {
  User.findById(req.body.user_id)
    .then((user) => {
      user.wallet += Number(req.body.amount);
      return user.save();
    })
    .then((result) => {
      const newUserLoan = new Loan({
        title: req.body.title,
        amount: req.body.amount,
        loanTenure: req.body.loanTenure,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone,
        address: req.body.address,
        email: req.body.email,
        userId: req.body.user_id,
      });
      newUserLoan
        .save()
        .then((userLoan) => {
          console.log(userLoan);
          return res.json(userLoan);
        })
        .catch((err) => console.log(err));
    })
    .catch((error) => console.log(error));
};

exports.getAllLoan = (req, res, next) => {
  const userId = req.params.clientId;
  console.log({ userId });
  Loan.find({ userId })
    .then((resp) => {
      console.log(resp);
      return res.json(resp);
    })
    .catch((err) => console.log(err));
};

exports.postRefundLoan = (req, res, next) => {
  const { loanId, userId } = req.params;
  User.findById(userId)
    .then((user) => {
      user.wallet = user.wallet - Number(req.body.amount);
      return user.save();
    })
    .then((result) => {
      Loan.findById(loanId)
        .then((loan) => {
          loan.amount = loan.amount - Number(req.body.amount);
          loan.save().then((val) => {
            return res.json(val);
          });
        })

        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
};
