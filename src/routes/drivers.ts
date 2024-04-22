import { Router } from "express";

import {
  addDriverToCompetition,
  createDriver,
  createDriverResult,
  deleteDriver,
  getDriverById,
  getDriverResults,
  getDrivers,
  updateDriver,
} from "../services/driverService";
import { authAdmin, authSelfOrAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authAdmin, getDrivers);
router.post("/", createDriver);

router.get("/:id", authSelfOrAdmin, getDriverById);
router.put("/:id", authSelfOrAdmin, updateDriver);
router.delete("/:id", authSelfOrAdmin, deleteDriver);

router.get("/:id/results", authSelfOrAdmin, getDriverResults);
router.post("/:id/results", authSelfOrAdmin, createDriverResult);

router.post("/:id/competitions", authSelfOrAdmin, addDriverToCompetition);

export default router;
