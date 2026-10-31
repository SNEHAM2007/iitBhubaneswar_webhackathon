
import {
  getAllDepartments,
  getDepartmentByCode,
  getDepartmentStatistics,
} from "../services/department.service.js";

// GET all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await getAllDepartments();

    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve departments",
    });
  }
};

// GET department by code
export const getDepartment = async (req, res) => {
  try {
    const { code } = req.params;

    const department = await getDepartmentByCode(code);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Get department error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve department",
    });
  }
};

// GET department statistics
export const getDepartmentStats = async (req, res) => {
  try {
    const { code } = req.params;

    const result = await getDepartmentStatistics(code);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Department statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve department statistics",
    });
  }
};
