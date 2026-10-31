import {
  getAllFaculty,
  getFacultyById,
  getFacultyByDepartment,
  getFacultyCount,
} from "../services/faculty.service.js";

// ==================================
// GET ALL FACULTY
// ==================================

export const getFacultyMembers = async (req, res) => {
  try {
    const faculty = await getAllFaculty();

    return res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty,
    });
  } catch (error) {
    console.error("Get all faculty error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve faculty members",
    });
  }
};

// ==================================
// GET FACULTY BY ID
// ==================================

export const getFacultyMember = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await getFacultyById(id);

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
    console.error("Get faculty by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve faculty member",
    });
  }
};

// ==================================
// GET FACULTY BY DEPARTMENT
// ==================================

export const getDepartmentFaculty = async (req, res) => {
  try {
    const { departmentCode } = req.params;

    const faculty = await getFacultyByDepartment(departmentCode);

    return res.status(200).json({
      success: true,
      departmentCode,
      count: faculty.length,
      data: faculty,
    });
  } catch (error) {
    console.error("Get department faculty error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve department faculty",
    });
  }
};

// ==================================
// GET TOTAL FACULTY COUNT
// ==================================

export const getFacultyStatistics = async (req, res) => {
  try {
    const totalFaculty = await getFacultyCount();

    return res.status(200).json({
      success: true,
      statistics: {
        totalFaculty,
      },
    });
  } catch (error) {
    console.error("Faculty statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve faculty statistics",
    });
  }
};
