import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (data) => {
  const { name, email, password, departmentCode, role } = data;

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error("Email is already registered. Please sign in instead.");
    error.status = 409;
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  const userRole = (role || "FACULTY").toUpperCase();

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      departmentCode: departmentCode ? departmentCode.toUpperCase() : null,
      role: userRole,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentCode: true,
      isActive: true,
    },
  });

  const token = generateToken(user);

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const token = generateToken(user);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentCode: user.departmentCode,
  };

  return {
    user: safeUser,
    token,
  };
};
