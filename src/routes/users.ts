import { Router } from "express";
import { authAdmin, authSelfOrAdmin } from "../middleware/authMiddleware";

import { deleteUser, getUserById, getUsers } from "../services/userService";

const router = Router();

router.get("/", authAdmin, getUsers);

router.get("/:id", authSelfOrAdmin, getUserById);
router.delete("/:id", authSelfOrAdmin, deleteUser);

export default router;
