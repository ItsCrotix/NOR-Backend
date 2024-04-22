import { Router } from "express";

import {
  createCompetition,
  deleteCompetition,
  deleteDriverFromCompetition,
  getCompetitionById,
  getCompetitions,
  getDriversInCompetition,
  updateCompetition,
} from "../services/competitionService";
import { authAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getCompetitions);
router.post("/", authAdmin, createCompetition);

router.get("/:id", getCompetitionById);
router.put("/:id", authAdmin, updateCompetition);
router.delete("/:id", authAdmin, deleteCompetition);

router.get("/:id/drivers/", authAdmin, getDriversInCompetition);
router.delete("/:id/drivers/", authAdmin, deleteDriverFromCompetition);

export default router;
