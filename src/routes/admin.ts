import { Router } from "express";

import { grantAdmin, revokeAdmin } from "../services/adminService";

const router = Router();

router.post("/grantAdmin", grantAdmin);
router.post("/revokeAdmin", revokeAdmin);

export default router;
