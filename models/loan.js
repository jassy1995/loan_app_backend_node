const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const loanSchema = new Schema({
  title: { type: String, required: true },
  first_grantor: { type: String, required: true },
  second_grantor: { type: String, required: true },
  refundAmount: { type: Number, required: true },
  latePayment: { type: Number, required: true },
  request_status: { type: String, required: true },
  payment_status: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  deuDate: { type: Date, required: true },
  date: { type: Date, default: Date.now(), required: true },
});

module.exports = mongoose.model("loans", loanSchema);
