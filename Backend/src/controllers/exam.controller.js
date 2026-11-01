import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../config/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPORTS_PATH = path.resolve(__dirname, "../../../exports/schedule.json");

const dayLabels = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

const sessionTimes = {
  AM: "09:30 – 11:30",
  PM: "14:00 – 16:00",
};

function getExportedExamsMap() {
  try {
    if (!fs.existsSync(EXPORTS_PATH)) return new Map();
    const content = fs.readFileSync(EXPORTS_PATH, "utf-8");
    const data = JSON.parse(content);
    if (!Array.isArray(data.exams)) return new Map();
    return new Map(data.exams.map((e) => [e.exam_id, e]));
  } catch (err) {
    console.warn("Could not read exported exams:", err);
    return new Map();
  }
}

function formatExam(exam, scheduledExam) {
  const course = exam.courses?.[0]?.course || {};
  const group = exam.groups?.[0]?.group || {};

  const dayCode = scheduledExam?.day;
  const sessionCode = scheduledExam?.session;
  const date = dayCode
    ? `${dayLabels[dayCode] || dayCode}, Midsem Week`
    : "Midsem Week";
  const startTime = sessionCode
    ? sessionTimes[sessionCode] || sessionCode
    : "09:30 – 11:30";
  const rooms = scheduledExam?.rooms || [];
  const roomString = rooms.length > 0 ? rooms.join(", ") : "Exam Hall";

  return {
    id: exam.id,
    subject: course.title || exam.id.replace(/^EX-/, ""),
    title: course.title || exam.id.replace(/^EX-/, ""),
    courseCode: course.id || exam.id.replace(/^EX-/, ""),
    code: course.id || exam.id.replace(/^EX-/, ""),
    date,
    startTime,
    time: startTime,
    room: roomString,
    rooms,
    studentCount: exam.size,
    attendance: exam.size,
    duration: `${exam.durationHours || 2} hours`,
    department: course.departmentCode || group.departmentCode || "All Departments",
    status: scheduledExam ? "SCHEDULED" : "SCHEDULED",
  };
}

export const listExams = async (req, res) => {
  try {
    const { status, search, department } = req.query;

    const exams = await prisma.exam.findMany({
      include: {
        courses: {
          include: {
            course: true,
          },
        },
        groups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const exportedMap = getExportedExamsMap();
    let formatted = exams.map((exam) =>
      formatExam(exam, exportedMap.get(exam.id)),
    );

    if (status && status !== "ALL") {
      formatted = formatted.filter(
        (e) => (e.status || "").toUpperCase() === status.toUpperCase(),
      );
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      formatted = formatted.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.courseCode.toLowerCase().includes(q) ||
          e.room.toLowerCase().includes(q),
      );
    }

    if (department && department !== "ALL") {
      formatted = formatted.filter((e) => e.department === department);
    }

    return res.status(200).json({
      success: true,
      count: formatted.length,
      exams: formatted,
    });
  } catch (error) {
    console.error("List exams error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve examinations",
    });
  }
};

export const getExamDetails = async (req, res) => {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: req.params.id },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const exportedMap = getExportedExamsMap();
    const formatted = formatExam(exam, exportedMap.get(exam.id));

    return res.status(200).json({
      success: true,
      exam: formatted,
      data: formatted,
    });
  } catch (error) {
    console.error("Get exam details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve exam details",
    });
  }
};

export const createExam = async (req, res) => {
  try {
    const { courseCode, studentCount, duration, size } = req.body;

    const examId = req.body.id || `EX-${courseCode || Date.now()}`;
    const examSize = Number(studentCount || size || 60);

    const exam = await prisma.exam.create({
      data: {
        id: examId,
        size: examSize,
        durationHours: Number(duration) || 2,
        courses: courseCode
          ? {
              create: [
                {
                  course: {
                    connect: { id: courseCode },
                  },
                },
              ],
            }
          : undefined,
      },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

    const formatted = formatExam(exam, null);

    return res.status(201).json({
      success: true,
      message: "Exam scheduled successfully",
      exam: formatted,
      data: formatted,
    });
  } catch (error) {
    console.error("Create exam error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create exam",
    });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, durationHours, studentCount, duration } = req.body;

    const data = {};
    if (size !== undefined || studentCount !== undefined) {
      data.size = Number(size ?? studentCount);
    }
    if (durationHours !== undefined || duration !== undefined) {
      data.durationHours = Number(durationHours ?? duration);
    }

    const exam = await prisma.exam.update({
      where: { id },
      data,
      include: {
        courses: {
          include: {
            course: true,
          },
        },
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

    const exportedMap = getExportedExamsMap();
    const formatted = formatExam(exam, exportedMap.get(exam.id));

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      exam: formatted,
      data: formatted,
    });
  } catch (error) {
    console.error("Update exam error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update exam",
    });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.exam.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Delete exam error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete exam",
    });
  }
};
