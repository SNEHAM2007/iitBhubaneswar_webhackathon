import express from "express";

import {
  generateSchedule,
  getLatestSchedule,
} from "../controllers/scheduling.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getLatestSchedule);
router.get("/latest", getLatestSchedule);
router.post("/generate", generateSchedule);

export default router;
