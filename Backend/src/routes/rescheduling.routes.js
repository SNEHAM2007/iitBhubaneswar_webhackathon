import express from "express";
import {
  listReschedulingRequests,
  getReschedulingRequestById,
  createReschedulingRequest,
  approveReschedulingRequest,
  rejectReschedulingRequest,
} from "../controllers/rescheduling.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", listReschedulingRequests);
router.get("/:id", getReschedulingRequestById);
router.post("/", createReschedulingRequest);
router.patch(
  "/:id/approve",
  authorizeRoles("ADMIN", "COORDINATOR"),
  approveReschedulingRequest,
);
router.patch(
  "/:id/reject",
  authorizeRoles("ADMIN", "COORDINATOR"),
  rejectReschedulingRequest,
);

export default router;
