const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const loanSchema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  loanTenure: { type: Number, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  address: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  date: { type: Date, default: Date.now(), required: true },
});

module.exports = mongoose.model("loans", loanSchema);
