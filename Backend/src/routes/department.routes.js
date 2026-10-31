import express from "express";

import {
  getDepartments,
  getDepartment,
  getDepartmentStats,
} from "../controllers/department.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All department routes require authentication
router.use(protect);

// GET /api/departments
router.get("/", getDepartments);

// GET /api/departments/:code/statistics
router.get("/:code/statistics", getDepartmentStats);

// GET /api/departments/:code
router.get("/:code", getDepartment);

export default router;
