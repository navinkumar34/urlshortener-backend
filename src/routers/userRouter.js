require("dotenv").config();
const express = require("express");
const User = require("../models/user");
const { compareHash, generateHash } = require("../utils/hash");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const router = express.Router();
const nodemailer = require("nodemailer");
const sendgridTransporter = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
  sendgridTransporter({
    auth: {
      api_key: process.env.SG_KEY
    }
  })
);

router
  .post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    await User.findOne({ email }).exec((err, user) => {
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }
      const token = jwt.sign(
        { name, email, password },
        process.env.JWT_ACC_KEY,
        {
          expiresIn: "2 days"
        }
      );

      const activationURL = `https://csb-zknem.netlify.app/activateuser/authenticate/${token}`;
      const mailOptions = {
        to: email,
        from: "urlshorten9@gmail.com",
        subject: "Activation Link for your Account on Shorten-URL",
        text: "",
        html: `<h4>Click on the below link to activate your account</h4><br/>
      <p><a href=${activationURL}>Activate Account</a></p>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res
            .status(400)
            .json({ error: "Something went wrong, Please try again" });
        } else {
          return res.status(200).json({
            message:
              "We have sent an activation link to your email. Please click on it to activate your account."
          });
        }
      });
    });
  })
  .post("/activateuser", (req, res) => {
    const { token } = req.body;
    if (token) {
      jwt.verify(token, process.env.JWT_ACC_KEY, async (err, decodedtoken) => {
        if (err) {
          return res.status(401).json({ error: "Invalid or expired link" });
        }
        const { name, email, password } = decodedtoken;
        const passwordhash = await generateHash(password);
        let newUser = new User({
          name: name,
          email: email,
          passwordhash: passwordhash
        });
        await newUser.save((err, success) => {
          if (err) {
            //console.log("Error in signup while account activation:", err);
            return res
              .status(400)
              .json({ error: "Error in signup while account activation" });
          }
          return res.json({
            message: "Signup success, please proceed to login!"
          });
        });
      });
    } else {
      return res.status(401).json({ error: "Invalid or expired link" });
    }
  })
  .post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).exec();
      if (user) {
        const result = await compareHash(password, user.passwordhash);
        if (result) {
          const jwtToken = jwt.sign({ email }, process.env.JWT_KEY, {
            expiresIn: "5 hours"
          });
          res.cookie("jwt", jwtToken, {
            httpOnly: true,
            secure: true
          });
          res.status(200).json({
            status: "login successful",
            token: jwtToken,
            name: user.name
          });
        } else {
          res.status(400).json({ error: "Invalid User" });
        }
      } else {
        res.status(400).json({ error: "Invalid User" });
      }
    } catch (error) {
      //console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  })
  .put("/forget-password", async (req, res) => {
    const { email } = req.body;
    await User.findOne({ email }).exec((err, user) => {
      if (err || !user) {
        return res
          .status(400)
          .json({ error: "User with this email address doesn't exists." });
      }
      const token = jwt.sign({ email }, process.env.JWT_PASS_KEY, {
        expiresIn: "2 days"
      });
      const resetpassURL = `https://csb-zknem.netlify.app/reset-password/authenticate/${token}`;
      const mailOptions = {
        to: email,
        from: "urlshorten9@gmail.com",
        subject: "Reset Password Link for your Account on Shorten-URL",
        text: "",
        html: `<h4>Click on the below link to reset your account password</h4><br/>
      <p><a href=${resetpassURL}>Reset Password</a></p>`
      };

      return user.updateOne({ resetLink: token }, (err, sucess) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Something went wrong please try again" });
        }
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res
              .status(500)
              .json({ error: "Something went wrong, Please try again" });
          } else {
            //console.log("Email sent");
            return res.status(200).json({
              message:
                "We have sent a link to your email. Please click on it to reset your account password."
            });
          }
        });
      });
    });
  })
  .put("/reset-password", (req, res) => {
    const { resetLink, newPass } = req.body;
    if (resetLink) {
      jwt.verify(
        resetLink,
        process.env.JWT_PASS_KEY,
        async (err, decodedtoken) => {
          if (err) {
            return res.status(401).json({ error: "Invalid or expired link" });
          }
          const passwordhash = await generateHash(newPass);
          await User.findOne({ resetLink }, (err, user) => {
            if (err || !user) {
              return res.status(400).json({ error: "Invalid or expired link" });
            }
            const obj = {
              passwordhash: passwordhash,
              resetLink: ""
            };

            user = _.extend(user, obj);
            user.save((err, result) => {
              if (err) {
                return res.status(500).json({
                  error: "Internal Server Error, Please try again in sometime"
                });
              }
              return res.status(200).json({
                message: "Password Reset Sucessful, Please proceed to Login"
              });
            });
          });
        }
      );
    } else {
      return res.status(401).json({ error: "Autentication error" });
    }
  });

module.exports = router;
