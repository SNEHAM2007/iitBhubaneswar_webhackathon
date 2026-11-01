import express from "express";

import {
  submitBooking,
  listBookings,
  getBookingDetails,
} from "../controllers/booking.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", submitBooking);
router.get("/", listBookings);
router.get("/:id", getBookingDetails);

export default router;