import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
  //   static userRegistration = async (req, res) => {
  //     const { name, email, password, password_confirmation, tc } = req.body;

  //     const user = await UserModel.findOne({ email: email });

  //     if (user) {
  //       res.send({  message: "Email already exist" });
  //     } else {
  //       if (name && email && password && password_confirmation && tc) {
  //         if (password === password_confirmation) {
  //           try {
  //             const salt = await bcrypt.genSalt();

  //             const hashPassword = await bcrypt.hash(password, salt);

  //             const doc = new UserModel({
  //               name: name,
  //               email: email,
  //               password: hashPassword,
  //               tc: tc,
  //             });

  //             await doc.save();

  //             const saved_user = await UserModel.findOne({ email: email });
  //             const token = jwt.sign(
  //               { userID: saved_user._id },
  //               process.env.JWT_SECRET_KEY,
  //               { expiresIn: "5d" }
  //             );

  //             res.send({
  //               status: "success",
  //               message: "Registration successful",
  //               token,
  //             });
  //           } catch (error) {
  //             res.send({
  //
  //               message: "Unable to register",
  //             });
  //           }
  //         } else {
  //           res.send({
  //
  //             message: "Password and confirm password doesn't match",
  //           });
  //         }
  //       } else {
  //         res.send({  message: "All fields are required" });
  //       }
  //     }
  //   };

  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModel.findOne({ email });

    if (user) return res.status(409).send({ message: "Email already exists" });
    if (!(name && email && password && password_confirmation && tc))
      return res.status(400).send({ message: "All fields are required" });
    if (password !== password_confirmation)
      return res.status(400).send({
        message: "Password and confirm password don't match",
      });

    try {
      const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt());
      const doc = new UserModel({ name, email, password: hashPassword, tc });
      await doc.save();
      const token = jwt.sign({ userID: doc._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "5d",
      });
      res
        .status(201)
        .send({ status: "success", message: "Registration successful", token });
    } catch (error) {
      res.status(500).send({ message: "Unable to register" });
    }
  };

  //   static userLogin = async (req, res) => {
  //     try {
  //       const { email, password } = req.body;

  //       if (email && password) {
  //         const user = await UserModel.findOne({ email: email });

  //         if (user != null) {
  //           const isMatch = await bcrypt.compare(password, user.password);
  //           if (user.email === email && isMatch) {
  //             const token = jwt.sign(
  //               { userID: user._id },
  //               process.env.JWT_SECRET_KEY,
  //               { expiresIn: "5d" }
  //             );

  //             res.send({ status: "success", message: "Login successful", token });
  //           } else {
  //             res.send({
  //
  //               message: "Email or password is invalid",
  //             });
  //           }
  //         } else {
  //           res.send({  message: "Email not found" });
  //         }
  //       } else {
  //         res.send({  message: "All fields are required" });
  //       }
  //     } catch (error) {
  //       res.send({  message: "Unable to login" });
  //     }
  //   };

  static userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send({ message: "All fields are required" });
    }

    try {
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(404).send({ message: "Email not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res
          .status(401)
          .send({ message: "Email or password is invalid" });

      const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "5d",
      });
      res.send({ status: "success", message: "Login successful", token });
    } catch (error) {
      res.status(500).send({ message: "Unable to login" });
    }
  };

  //   static changeUserPassword = async (req, res) => {
  //     try {
  //       const { password, password_confirmation } = req.body;

  //       if (password && password_confirmation) {
  //         if (password !== password_confirmation) {
  //           res.send({
  //
  //             message: "New password and confirm new password doesn't match",
  //           });
  //         } else {
  //           const salt = await bcrypt.genSalt(10);
  //           const newHashPassword = await bcrypt.hash(password, salt);

  //           await UserModel.findByIdAndUpdate(req.user._id, {
  //             $set: { password: newHashPassword },
  //           });

  //           res.send({
  //             status: "success",
  //             message: "Password changed successfully",
  //           });
  //         }
  //       } else {
  //         res.send({  message: "All fields are required" });
  //       }
  //     } catch (error) {}
  //   };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;

    if (!(password && password_confirmation))
      return res.status(400).send({ message: "All fields are required" });
    if (password !== password_confirmation)
      return res.send({
        message: "New password and confirm new password don't match",
      });

    try {
      const newHashPassword = await bcrypt.hash(password, 10);
      await UserModel.findByIdAndUpdate(req.user._id, {
        $set: { password: newHashPassword },
      });
      res.send({ status: "success", message: "Password changed successfully" });
    } catch (error) {
      res.status(500).send({ message: "Unable to change password" });
    }
  };

  //   static loggedUser = async (req, res) => {
  //     const { user } = req;
  //     res.send({ user });
  //   };

  static loggedUser = (req, res) => {
    res.send({ user: req.user });
  };

  //   static sendUserPasswordResetEmail = async (req, res) => {
  //     const { email } = req.body;
  //     if (email) {
  //       const user = await UserModel.findOne({ email: email });

  //       if (user) {
  //         const secret = user._id + process.env.JWT_SECRET_KEY;

  //         const token = jwt.sign({ userID: user._id }, secret, {
  //           expiresIn: "15m",
  //         });

  //         const link = `http://127.0.0.1:3000/api/user/reset-password/${user._id}/${token}`;

  //         //sending email
  //         let info = await transporter.sendMail({
  //           from: process.env.EMAIL_FROM,
  //           to: user.email,
  //           subject: "Authentication - Password resent link",
  //           html: `<a href=${link}>Click here</a> to reset your password`,
  //         });

  //         res.send({
  //           status: "success",
  //           message: "Password resent email sent...please check your email",
  //           link,
  //         });
  //       } else {
  //         res.send({
  //
  //           message: "Email not found",
  //         });
  //       }
  //     } else {
  //       res.send({
  //
  //         message: "Email is required",
  //       });
  //     }
  //   };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: "Email is required" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).send({ message: "Email not found" });

    const secret = user._id + process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "15m" });
    const link = `http://127.0.0.1:3000/api/user/reset-password/${user._id}/${token}`;

    // sending email
    const info = await transporter.sendMail({
      //   from: process.env.EMAIL_FROM,
      from: "edison.rath@ethereal.email",
      to: user.email,
      subject: "Authentication - Password reset link",
      html: `<a href=${link}>Click here</a> to reset your password`,
    });

    res.send({
      status: "success",
      message: "Password reset email sent...please check your email",
      info,
    });
  };

  //   static userPasswordReset = async (req, res) => {
  //     const { password, password_confirmation } = req.body;
  //     const { id, token } = req.params;

  //     const user = await UserModel.findById(id);
  //     const new_secret = user._id + process.env.JWT_SECRET_KEY;

  //     try {
  //       jwt.verify(token, new_secret);

  //       if (password && password_confirmation) {
  //         if (password !== password_confirmation) {
  //           res.send({
  //
  //             message: "New password and confirm new password does not match",
  //           });
  //         } else {
  //           const salt = await bcrypt.genSalt(10);
  //           const newHashPassword = await bcrypt.hash(password, salt);

  //           await UserModel.findByIdAndUpdate(user._id, {
  //             $set: { password: newHashPassword },
  //           });

  //           res.send({
  //             status: "success",
  //             message: "Password changed successfully",
  //           });
  //         }
  //       } else {
  //         res.send({
  //
  //           message: "All fields are required",
  //         });
  //       }
  //     } catch (error) {
  //       res.send({
  //
  //         message: "Invalid token",
  //       });
  //     }
  //   };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;

    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;

    try {
      jwt.verify(token, new_secret);

      if (!(password && password_confirmation))
        return res.send({
          message: "All fields are required",
        });
      if (password !== password_confirmation)
        return res.send({
          message: "New password and confirm new password do not match",
        });

      const newHashPassword = await bcrypt.hash(password, 10);
      await UserModel.findByIdAndUpdate(user._id, {
        $set: { password: newHashPassword },
      });

      res.send({ status: "success", message: "Password changed successfully" });
    } catch (error) {
      res.send({ message: "Invalid token" });
    }
  };
}

export default UserController;
