
import { registerUser, loginUser } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      ...result,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (
      error.message ===
      "Email is already registered. Please sign in instead."
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("required") ||
      error.message.includes("Password must") ||
      error.message.includes("Invalid registration role")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    if (
      error.message === "Invalid email or password" ||
      error.message === "Email and password are required"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
