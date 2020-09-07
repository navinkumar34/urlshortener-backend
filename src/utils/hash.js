require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 5;

exports.generateHash = (plainTextPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plainTextPassword, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};

exports.compareHash = (plainTextPassword, hashPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainTextPassword, hashPassword, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
