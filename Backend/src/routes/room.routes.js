import express from "express";
import {
  listRooms,
  getRoomDetails,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/room.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", listRooms);
router.get("/:id", getRoomDetails);
router.post("/", authorizeRoles("ADMIN", "COORDINATOR"), createRoom);
router.patch("/:id", authorizeRoles("ADMIN"), updateRoom);
router.delete("/:id", authorizeRoles("ADMIN"), deleteRoom);

export default router;
