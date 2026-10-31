import {
  linkFacultyAccount,
  getFacultyAccountMappings,
} from "../services/facultyAccount.service.js";

// ==========================================
// LINK USER ACCOUNT TO FACULTY
// ==========================================

export const linkFaculty = async (req, res) => {
  try {
    const { userId } = req.params;
    const { facultyId } = req.body;

    if (!facultyId || typeof facultyId !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid facultyId is required",
      });
    }

    const result = await linkFacultyAccount(userId, facultyId);

    return res.status(200).json({
      success: true,
      message: "Faculty account linked successfully",
      data: result,
    });
  } catch (error) {
    console.error("Faculty account linking error:", error);

    const clientErrors = [
      "User account not found",
      "Only FACULTY accounts can be linked",
      "Faculty record not found",
      "This user is already linked to a faculty record",
      "This faculty record is already linked to another user",
      "User department does not match faculty department",
    ];

    if (clientErrors.includes(error.message)) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to link faculty account",
    });
  }
};

// ==========================================
// GET ALL FACULTY ACCOUNT MAPPINGS
// ==========================================

export const getFacultyMappings = async (req, res) => {
  try {
    const mappings = await getFacultyAccountMappings();

    return res.status(200).json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    console.error("Faculty mappings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve faculty account mappings",
    });
  }
};
