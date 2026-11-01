import express from "express";

import { getDashboardOverview } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getDashboardOverview);

export default router;
