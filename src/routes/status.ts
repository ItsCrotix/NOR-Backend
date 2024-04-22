import { Router } from "express";
import { checkServerStatus } from "../services/statusService";

const router = Router();

router.get("/", checkServerStatus);

export default router;
