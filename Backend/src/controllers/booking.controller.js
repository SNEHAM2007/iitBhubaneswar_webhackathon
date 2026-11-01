
import {
  createBookingRequest,
  getBookingRequests,
  getBookingRequestById,
} from "../services/booking.service.js";
import { parseBookingRequestText } from "../services/bookingParser.service.js";

export const parseBookingRequest = async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text || text.length > 4000) {
    return res.status(400).json({
      success: false,
      message: "Enter a request between 1 and 4000 characters.",
    });
  }

  try {
    const draft = await parseBookingRequestText(text);
    return res.status(200).json({ success: true, data: draft });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Booking request parsing error:", error);
    return res.status(502).json({
      success: false,
      message: "The booking parser is temporarily unavailable.",
    });
  }
};

// Submit a booking request
export const submitBooking = async (req, res) => {
  try {
    const {
      requestedCategory,
      title,
      attendance,
      durationPeriods,
      windows,
      roomTypes,
      needs,
      requestedRoomId,
      seriesId,
      rawText,
      mandatoryGroupIds,
    } = req.body;

    if (
      !requestedCategory ||
      !title ||
      !Number.isInteger(attendance) ||
      attendance <= 0 ||
      !Number.isInteger(durationPeriods) ||
      durationPeriods <= 0 ||
      !windows
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details",
      });
    }

    const booking = await createBookingRequest({
      requester: req.user.name,
      role: req.user.role,
      departmentCode: req.user.departmentCode,
      requestedCategory,
      title,
      attendance,
      durationPeriods,
      windows,
      roomTypes,
      needs,
      requestedRoomId,
      seriesId,
      rawText,
      mandatoryGroupIds,
    });

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Submit booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit booking request",
    });
  }
};

// Get booking requests
export const listBookings = async (req, res) => {
  try {
    const filters =
      req.user.role === "ADMIN"
        ? {}
        : { requester: req.user.name };

    const bookings = await getBookingRequests(filters);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("List bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve booking requests",
    });
  }
};

// Get a booking request by ID
export const getBookingDetails = async (req, res) => {
  try {
    const booking = await getBookingRequestById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found",
      });
    }

    // Non-admin users can only view their own requests
    if (
      req.user.role !== "ADMIN" &&
      booking.requester !== req.user.name
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot view this booking request",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Booking details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve booking details",
    });
  }
};
