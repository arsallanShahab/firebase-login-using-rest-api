import { Router } from "express";
import userController from "../controller/user.controller";
import { limiter, verifyToken } from "../middleware";

const router = Router();

router.post("/login", limiter, userController.loginUser);
router.post("/verify-otp", userController.verifyOTP);
router.post("/create", verifyToken, userController.createUser);

export default router;
