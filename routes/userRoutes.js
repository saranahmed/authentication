import express from "express";
const router = express.Router();

import UserController from "../controllers/UserController.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

router.use("/changepassword", checkUserAuth);
router.use("/profile", checkUserAuth);

//public

router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);
router.post(
  "/send-reset-password-email",
  UserController.sendUserPasswordResetEmail
);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

//private

router.post("/changepassword", UserController.changeUserPassword);
router.get("/profile", UserController.loggedUser);

export default router;
