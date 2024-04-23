import { Router } from "express";
import {
  disableTwoFactorAuth,
  enableTwoFactorAuth,
  loginUser,
  refreshUser,
  registerUser,
} from "../services/authService";

const router = Router();

// Routes for authentication
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/refresh", refreshUser);
router.get("/enable-tfa", enableTwoFactorAuth);
router.get("/disable-tfa", disableTwoFactorAuth);

export default router;
