const express = require("express");
const path = require("path");
const axios = require("axios");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const userRoute = require("./routes/user");
const loanRoute = require("./routes/loan");
const adminRoute = require("./routes/admin");

//make all the variable inside .env file available for use
const process = require("process");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
const mongoose = require("mongoose");
// const db = process.env.mongoURI;
const db = process.env.OffLineMongoURI;
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(userRoute);
app.use(loanRoute);
app.use(adminRoute);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
