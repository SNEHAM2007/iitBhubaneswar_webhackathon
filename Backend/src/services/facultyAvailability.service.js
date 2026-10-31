import { prisma } from "../config/prisma.js";

// ==================================
// GET FACULTY AVAILABILITY
// ==================================

export const getFacultyAvailability = async (facultyId) => {
  const faculty = await prisma.faculty.findUnique({
    where: {
      id: facultyId,
    },
    select: {
      id: true,
      name: true,
      departmentCode: true,
      unavailable: true,
      preferences: true,
      maxHoursPerDay: true,
    },
  });

  if (!faculty) {
    return null;
  }

  return {
    facultyId: faculty.id,
    name: faculty.name,
    departmentCode: faculty.departmentCode,
    maxHoursPerDay: faculty.maxHoursPerDay,
    unavailable: faculty.unavailable,
    preferences: faculty.preferences,
  };
};

// ==================================
// GET ALL FACULTY AVAILABILITY
// ==================================

export const getAllFacultyAvailability = async () => {
  return await prisma.faculty.findMany({
    select: {
      id: true,
      name: true,
      departmentCode: true,
      unavailable: true,
      preferences: true,
      maxHoursPerDay: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};
