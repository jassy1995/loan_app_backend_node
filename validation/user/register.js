const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateRegisterInput(data) {
  let errors = {};
  // Convert empty fields to an empty string so we can use validator functions
  data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
  data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";
  data.city = !isEmpty(data.city) ? data.city : "";
  data.states = !isEmpty(data.states) ? data.states : "";
  data.address = !isEmpty(data.address) ? data.address : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmPassword = !isEmpty(data.confirmPassword)
    ? data.confirmPassword
    : "";
  // first_name checks
  if (Validator.isEmpty(data.first_name)) {
    errors.first_name = "first name field is required";
  }
  // last_name checks
  if (Validator.isEmpty(data.last_name)) {
    errors.last_name = "last name field is required";
  }
  // phone checks
  if (Validator.isEmpty(data.phone)) {
    errors.phone = "phone field is required";
  }
  // phone checks
  if (Validator.isEmpty(data.city)) {
    errors.city = "city field is required";
  }
  // phone checks
  if (Validator.isEmpty(data.states)) {
    errors.states = "state field is required";
  }
  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  // Address checks
  if (Validator.isEmpty(data.address)) {
    errors.address = "address field is required";
  }
  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
  if (Validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Confirm password field is required";
  }
  // if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
  //   errors.password = "Password must be at least 6 characters";
  // }
  if (!Validator.equals(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Passwords must match";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
