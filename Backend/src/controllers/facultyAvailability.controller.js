import {
  getFacultyAvailability,
  getAllFacultyAvailability,
} from "../services/facultyAvailability.service.js";

// ==================================
// GET ONE FACULTY MEMBER AVAILABILITY
// ==================================

export const getFacultyAvailabilityDetails = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await getFacultyAvailability(facultyId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error("Faculty availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve faculty availability",
    });
  }
};

// ==================================
// GET ALL FACULTY AVAILABILITY
// ==================================

export const getAllFacultyAvailabilityDetails = async (req, res) => {
  try {
    const faculty = await getAllFacultyAvailability();

    return res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty,
    });
  } catch (error) {
    console.error("All faculty availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve faculty availability",
    });
  }
};
