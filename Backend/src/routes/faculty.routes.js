import express from "express";

import {
  getFacultyMembers,
  getFacultyMember,
  getDepartmentFaculty,
  getFacultyStatistics,
} from "../controllers/faculty.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All faculty routes require authentication
router.use(protect);

// GET /api/faculty
router.get("/", getFacultyMembers);

// GET /api/faculty/statistics
router.get("/statistics", getFacultyStatistics);

// GET /api/faculty/department/:departmentCode
router.get("/department/:departmentCode", getDepartmentFaculty);

// GET /api/faculty/:id
router.get("/:id", getFacultyMember);

export default router;
