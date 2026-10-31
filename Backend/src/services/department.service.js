import { prisma } from "../config/prisma.js";

// Get all departments
export const getAllDepartments = async () => {
  return await prisma.department.findMany({
    orderBy: {
      code: "asc",
    },
  });
};

// Get department by code
export const getDepartmentByCode = async (code) => {
  return await prisma.department.findUnique({
    where: {
      code,
    },
  });
};

// Get department statistics
export const getDepartmentStatistics = async (code) => {
  const department = await prisma.department.findUnique({
    where: { code },
  });

  if (!department) {
    return null;
  }

  const [facultyCount, courseCount, studentGroupCount] = await Promise.all([
    prisma.faculty.count({
      where: { departmentCode: code },
    }),
    prisma.course.count({
      where: { departmentCode: code },
    }),
    prisma.studentGroup.count({
      where: { departmentCode: code },
    }),
  ]);

  return {
    department,
    statistics: {
      facultyCount,
      courseCount,
      studentGroupCount,
    },
  };
};
