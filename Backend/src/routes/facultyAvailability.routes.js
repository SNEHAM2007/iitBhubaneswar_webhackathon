import express from "express";

import {
  getFacultyAvailabilityDetails,
  getAllFacultyAvailabilityDetails,
} from "../controllers/facultyAvailability.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All availability routes require authentication
router.use(protect);

// Admin can view all faculty availability
router.get("/", authorizeRoles("ADMIN"), getAllFacultyAvailabilityDetails);

// Admin can view a specific faculty member's availability
router.get(
  "/:facultyId",
  authorizeRoles("ADMIN"),
  getFacultyAvailabilityDetails,
);

export default router;
