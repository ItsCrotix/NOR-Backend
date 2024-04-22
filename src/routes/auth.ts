import { Router } from "express";
import { loginUser, refreshUser, registerUser } from "../services/authService";

const router = Router();

// Routes for authentication
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/refresh", refreshUser);

export default router;
