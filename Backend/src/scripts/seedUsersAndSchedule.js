import "dotenv/config";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../config/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPORTS_PATH = path.resolve(__dirname, "../../../exports/schedule.json");

async function seed() {
  console.log("Starting seed script...");

  // 1. Seed demo accounts
  const demoUsers = [
    {
      name: "CSE Department Coordinator",
      email: "coordinator@cit.edu",
      password: "Coord@123",
      role: "COORDINATOR",
      departmentCode: "CSE",
      facultyId: null,
    },
    {
      name: "Dr. A. Sharma (Faculty)",
      email: "faculty@cit.edu",
      password: "Faculty@123",
      role: "FACULTY",
      departmentCode: "CSE",
      facultyId: "F01",
    },
    {
      name: "Test Faculty",
      email: "faculty@example.com",
      password: "Faculty@123",
      role: "FACULTY",
      departmentCode: "CSE",
      facultyId: "F02",
    },
    {
      name: "Cultural Club President",
      email: "club@cit.edu",
      password: "Club@123",
      role: "CLUB_REP",
      departmentCode: null,
      facultyId: null,
    },
  ];

  for (const demo of demoUsers) {
    const passwordHash = await bcrypt.hash(demo.password, 10);
    await prisma.user.upsert({
      where: { email: demo.email },
      update: {
        name: demo.name,
        passwordHash,
        role: demo.role,
        departmentCode: demo.departmentCode,
        facultyId: demo.facultyId,
        isActive: true,
      },
      create: {
        name: demo.name,
        email: demo.email,
        passwordHash,
        role: demo.role,
        departmentCode: demo.departmentCode,
        facultyId: demo.facultyId,
        isActive: true,
      },
    });
    console.log(`Demo user ready: ${demo.email} (${demo.role})`);
  }

  // 2. Check and sync published schedule from exports/schedule.json if DB has 0 schedules
  const scheduleCount = await prisma.schedule.count();
  console.log(`Existing schedule count in DB: ${scheduleCount}`);

  if (scheduleCount === 0 && fs.existsSync(EXPORTS_PATH)) {
    console.log("Importing schedule from exports/schedule.json into database...");
    const content = fs.readFileSync(EXPORTS_PATH, "utf-8");
    const exportData = JSON.parse(content);

    const teachingSessions = await prisma.teachingSession.findMany({
      select: { id: true, duration: true },
    });
    const durationMap = new Map(teachingSessions.map((s) => [s.id, s.duration || 1]));

    const scheduledSessions = exportData.sessions.map((item) => {
      const duration = durationMap.get(item.session_id) || 1;
      return {
        sessionId: item.session_id,
        roomId: item.room_id,
        day: item.day,
        startPeriod: item.start_period,
        endPeriod: item.start_period + duration - 1,
      };
    });

    const newSchedule = await prisma.schedule.create({
      data: {
        name: "Official academic timetable",
        version: 1,
        status: "PUBLISHED",
        sessions: {
          create: scheduledSessions,
        },
      },
    });

    console.log(
      `Schedule published to DB successfully! ID: ${newSchedule.id}, sessions: ${scheduledSessions.length}`,
    );
  }

  console.log("Seed completed successfully!");
}

try {
  await seed();
} catch (error) {
  console.error("Seed error:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
