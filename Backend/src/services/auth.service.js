import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (data) => {
  const { name, email, password, departmentCode } = data;

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user with default role
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      departmentCode: departmentCode || null,
      role: "FACULTY",
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
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

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

  return {
    user: safeUser,
    token,
  };
};