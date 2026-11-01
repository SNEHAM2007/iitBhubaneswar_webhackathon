import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../config/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPORTS_PATH = path.resolve(__dirname, "../../../exports/schedule.json");

const schedulerUrl = () =>
  (process.env.SCHEDULER_URL || "http://localhost:8001").replace(/\/+$/, "");

const periodTimes = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
  { start: "17:00", end: "18:00" },
];

const dayCodes = new Map([
  ["Monday", "MON"],
  ["Tuesday", "TUE"],
  ["Wednesday", "WED"],
  ["Thursday", "THU"],
  ["Friday", "FRI"],
  ["Saturday", "SAT"],
]);

const dayNames = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

export function formatScheduleSessions(scheduledSessions) {
  return scheduledSessions.map((scheduled) => {
    const startPeriodIdx = Math.max(0, scheduled.startPeriod - 1);
    const endPeriodIdx = Math.min(periodTimes.length - 1, Math.max(0, scheduled.endPeriod - 1));
    const startTime = periodTimes[startPeriodIdx]?.start || "08:00";
    const endTime = periodTimes[endPeriodIdx]?.end || "09:00";
    const day = dayNames[scheduled.day] || scheduled.day;
    const session = scheduled.session || {};
    const course = session.course || {};
    const faculty = session.faculty || {};
    const room = scheduled.room || {};
    const groups = session.groups?.map((g) => g.group?.name || g.groupId) || [];
    const firstGroup = session.groups?.[0]?.group || {};

    return {
      id: session.id || scheduled.sessionId,
      day,
      startTime,
      time: `${startTime} - ${endTime}`,
      subject: course.title || session.courseId || "Scheduled Session",
      courseCode: session.courseId || "",
      faculty: faculty.name || session.facultyId || "",
      roomId: scheduled.roomId,
      room: room.name || scheduled.roomId,
      department: firstGroup.departmentCode || course.departmentCode || "",
      year: firstGroup.year || course.year || 1,
      groups,
      kind: session.kind || "lecture",
      duration: scheduled.endPeriod - scheduled.startPeriod + 1,
    };
  });
}

async function importExportedScheduleIfAvailable() {
  try {
    if (!fs.existsSync(EXPORTS_PATH)) {
      return null;
    }

    const fileContent = fs.readFileSync(EXPORTS_PATH, "utf-8");
    const exportData = JSON.parse(fileContent);

    if (!Array.isArray(exportData.sessions) || exportData.sessions.length === 0) {
      return null;
    }

    const teachingSessions = await prisma.teachingSession.findMany({
      select: { id: true, duration: true },
    });
    const sessionDurationMap = new Map(
      teachingSessions.map((s) => [s.id, s.duration || 1]),
    );

    const scheduledSessions = exportData.sessions.map((item) => {
      const duration = sessionDurationMap.get(item.session_id) || 1;
      return {
        sessionId: item.session_id,
        roomId: item.room_id,
        day: item.day,
        startPeriod: item.start_period,
        endPeriod: item.start_period + duration - 1,
      };
    });

    const createdSchedule = await prisma.schedule.create({
      data: {
        name: "Official academic timetable",
        version: 1,
        status: "PUBLISHED",
        sessions: {
          create: scheduledSessions,
        },
      },
      include: {
        sessions: {
          include: {
            room: true,
            session: {
              include: {
                course: true,
                faculty: true,
                groups: {
                  include: {
                    group: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return createdSchedule;
  } catch (error) {
    console.error("Error importing exported schedule:", error);
    return null;
  }
}

async function savePublishedSchedule(timetable) {
  const periodStarts = periodTimes.map((p) => p.start);
  const startsByTime = new Map(
    periodStarts.map((start, index) => [start, index + 1]),
  );

  const scheduledSessions = timetable.map((session) => {
    const startPeriod = startsByTime.get(session.startTime);
    const day = dayCodes.get(session.day) || session.day;

    if (!startPeriod || !day || !Number.isInteger(session.duration)) {
      throw new Error(`Invalid generated session data for ${session.id}`);
    }

    return {
      sessionId: session.id,
      roomId: session.roomId,
      day,
      startPeriod,
      endPeriod: startPeriod + session.duration - 1,
    };
  });

  await prisma.$transaction(async (transaction) => {
    const latestVersion = await transaction.schedule.aggregate({
      _max: { version: true },
    });

    await transaction.schedule.updateMany({
      where: { status: "PUBLISHED" },
      data: { status: "ARCHIVED" },
    });

    await transaction.schedule.create({
      data: {
        name: "Generated academic timetable",
        version: (latestVersion._max.version || 0) + 1,
        status: "PUBLISHED",
        sessions: {
          create: scheduledSessions,
        },
      },
    });
  });
}

export const getLatestSchedule = async (req, res) => {
  try {
    let latest = await prisma.schedule.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { version: "desc" },
      include: {
        sessions: {
          include: {
            room: true,
            session: {
              include: {
                course: true,
                faculty: true,
                groups: {
                  include: {
                    group: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!latest || latest.sessions.length === 0) {
      latest = await importExportedScheduleIfAvailable();
    }

    if (!latest || latest.sessions.length === 0) {
      return res.status(200).json({
        success: true,
        has_schedule: false,
        total_sessions: 0,
        solver_status: "NOT_GENERATED",
        timetable: [],
        message: "No schedule generated yet",
      });
    }

    const timetable = formatScheduleSessions(latest.sessions);

    return res.status(200).json({
      success: true,
      has_schedule: true,
      scheduleId: latest.id,
      name: latest.name,
      version: latest.version,
      generatedAt: latest.generatedAt,
      total_sessions: timetable.length,
      solver_status: "OPTIMAL",
      timetable,
    });
  } catch (error) {
    console.error("Get latest schedule error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve the latest timetable",
    });
  }
};

export const generateSchedule = async (req, res) => {
  let schedulerResponse;

  try {
    schedulerResponse = await fetch(
      `${schedulerUrl()}/api/scheduling/generate`,
      {
        method: "POST",
        signal: AbortSignal.timeout(180000),
      },
    );
  } catch (error) {
    console.error("Scheduler service request failed:", error);

    const timedOut =
      error.name === "TimeoutError" || error.name === "AbortError";

    return res.status(timedOut ? 504 : 502).json({
      success: false,
      message: timedOut
        ? "The scheduling service timed out. Please try again."
        : "Unable to connect to the scheduling service.",
    });
  }

  const responseBody = await schedulerResponse.text();
  let result;

  try {
    result = JSON.parse(responseBody);
  } catch (error) {
    console.error("Scheduler service returned an invalid response:", error);
    return res.status(502).json({
      success: false,
      message: "The scheduling service returned an invalid response.",
    });
  }

  if (schedulerResponse.ok && result.success) {
    try {
      if (!Array.isArray(result.timetable)) {
        throw new Error("Scheduler response is missing timetable sessions");
      }

      await savePublishedSchedule(result.timetable);
    } catch (error) {
      console.error("Failed to save generated schedule:", error);
      return res.status(500).json({
        success: false,
        message:
          "The timetable was generated but could not be saved to the campus database.",
      });
    }
  }

  return res.status(schedulerResponse.status).json(result);
};
