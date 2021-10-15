const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminMessageSchema = new Schema({
  message: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
});

module.exports = mongoose.model("messages", adminMessageSchema);
