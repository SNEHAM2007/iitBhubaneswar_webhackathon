import { prisma } from "../config/prisma.js";

// ==========================================
// LINK USER ACCOUNT WITH FACULTY RECORD
// ==========================================

export const linkFacultyAccount = async (userId, facultyId) => {
  // Check whether user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User account not found");
  }

  // Only faculty accounts can be linked
  if (user.role !== "FACULTY") {
    throw new Error("Only FACULTY accounts can be linked");
  }

  // Check whether faculty record exists
  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
  });

  if (!faculty) {
    throw new Error("Faculty record not found");
  }

  // Check whether user is already linked
  if (user.facultyId) {
    throw new Error("This user is already linked to a faculty record");
  }

  // Check whether faculty is already linked to another user
  const existingLink = await prisma.user.findUnique({
    where: { facultyId },
  });

  if (existingLink) {
    throw new Error("This faculty record is already linked to another user");
  }

  // Department consistency check
  if (user.departmentCode && user.departmentCode !== faculty.departmentCode) {
    throw new Error("User department does not match faculty department");
  }

  // Link account and synchronize department
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      facultyId: faculty.id,
      departmentCode: faculty.departmentCode,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentCode: true,
      facultyId: true,
    },
  });

  return {
    user: updatedUser,
    faculty: {
      id: faculty.id,
      name: faculty.name,
      departmentCode: faculty.departmentCode,
    },
  };
};

// ==========================================
// GET ALL USER-FACULTY MAPPINGS
// ==========================================

export const getFacultyAccountMappings = async () => {
  return await prisma.user.findMany({
    where: {
      facultyId: {
        not: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentCode: true,
      faculty: {
        select: {
          id: true,
          name: true,
          departmentCode: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};
