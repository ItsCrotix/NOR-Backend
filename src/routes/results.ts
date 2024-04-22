import { Router } from "express";
import { authSelfOrAdmin, authUser } from "../middleware/authMiddleware";
import {
  deleteResult,
  getResultById,
  getResults,
  updateResult,
} from "../services/resultsService";

const router = Router();

router.get("/", authUser, getResults);
router.get("/:id", authSelfOrAdmin, getResultById);
router.post("/:id", authUser, updateResult);
router.delete("/:id", authSelfOrAdmin, deleteResult);

export default router;
