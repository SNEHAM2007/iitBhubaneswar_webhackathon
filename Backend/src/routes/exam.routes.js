import express from "express";
import {
  listExams,
  getExamDetails,
  createExam,
  updateExam,
  deleteExam,
} from "../controllers/exam.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", listExams);
router.get("/:id", getExamDetails);
router.post("/", authorizeRoles("ADMIN", "COORDINATOR"), createExam);
router.patch("/:id", authorizeRoles("ADMIN", "COORDINATOR"), updateExam);
router.delete("/:id", authorizeRoles("ADMIN"), deleteExam);

export default router;
