
import { prisma } from "../config/prisma.js";

// ==================================
// GET ALL FACULTY MEMBERS
// ==================================

export const getAllFaculty = async () => {
  return await prisma.faculty.findMany({
    select: {
      id: true,
      name: true,
      departmentCode: true,
      maxHoursPerDay: true,
      needsAccessible: true,
      unavailable: true,
      preferences: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

// ==================================
// GET FACULTY MEMBER BY ID
// ==================================

export const getFacultyById = async (facultyId) => {
  return await prisma.faculty.findUnique({
    where: {
      id: facultyId,
    },
    select: {
      id: true,
      name: true,
      departmentCode: true,
      maxHoursPerDay: true,
      needsAccessible: true,
      unavailable: true,
      preferences: true,
    },
  });
};

// ==================================
// GET FACULTY BY DEPARTMENT
// ==================================

export const getFacultyByDepartment = async (departmentCode) => {
  return await prisma.faculty.findMany({
    where: {
      departmentCode,
    },
    select: {
      id: true,
      name: true,
      departmentCode: true,
      maxHoursPerDay: true,
      needsAccessible: true,
      unavailable: true,
      preferences: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

// ==================================
// GET FACULTY COUNT
// ==================================

export const getFacultyCount = async () => {
  return await prisma.faculty.count();
};
