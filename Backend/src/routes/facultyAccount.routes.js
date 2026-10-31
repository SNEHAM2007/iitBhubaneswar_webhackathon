import express from "express";

import {
  linkFaculty,
  getFacultyMappings,
} from "../controllers/facultyAccount.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All routes require authentication and ADMIN role
router.use(protect);
router.use(authorizeRoles("ADMIN"));

// GET all linked faculty accounts
router.get("/", getFacultyMappings);

// LINK a user account with a faculty record
router.put("/:userId/link", linkFaculty);

export default router;
