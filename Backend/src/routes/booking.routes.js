import express from "express";

import {
  parseBookingRequest,
  submitBooking,
  listBookings,
  getBookingDetails,
} from "../controllers/booking.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/parse", parseBookingRequest);
router.post("/", submitBooking);
router.get("/", listBookings);
router.get("/:id", getBookingDetails);

export default router;