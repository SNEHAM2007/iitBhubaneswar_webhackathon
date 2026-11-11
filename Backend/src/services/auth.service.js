import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (data) => {
  const { name, email, password, departmentCode, role } = data;

  // Validate required fields
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  if (password.length < 8) {
    throw new Error("Password must contain at least 8 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("Email is already registered. Please sign in instead.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userRole = (role || "FACULTY").toUpperCase();

  if (!["FACULTY", "COORDINATOR", "CLUB_REP", "ADMIN"].includes(userRole)) {
    throw new Error("Invalid registration role");
  }

  // Validate department exists when provided (foreign key constraint)
  const normalizedDeptCode =
    departmentCode && ["FACULTY", "COORDINATOR"].includes(userRole)
      ? departmentCode.trim().toUpperCase()
      : null;

  if (normalizedDeptCode) {
    const department = await prisma.department.findUnique({
      where: { code: normalizedDeptCode },
    });

    if (!department) {
      throw new Error(
        `Department "${normalizedDeptCode}" does not exist. Please contact an administrator.`
      );
    }
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      departmentCode: normalizedDeptCode,
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
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentCode: user.departmentCode,
  };

  return { user: safeUser, token };
};
