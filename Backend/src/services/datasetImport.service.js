import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { prisma } from "../config/prisma.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const DATASET_DIR = resolve(currentDir, "../../dataset");

// Read CSV file.
function readCsv(filename) {
  const filePath = resolve(DATASET_DIR, filename);
  const content = readFileSync(filePath, "utf8");

  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
}

// Parse JSON columns.
function parseJson(value, fallback = []) {
  if (value === undefined || value === null || value.trim() === "") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Invalid JSON value in CSV: ${value}`);
  }
}

// Convert values to integers.
function toInt(value, field) {
  const result = Number.parseInt(value, 10);

  if (!Number.isFinite(result)) {
    throw new Error(`Invalid integer in field "${field}": ${value}`);
  }

  return result;
}

// Convert CSV values to booleans.
function toBoolean(value) {
  return ["true", "1", "yes"].includes(String(value).trim().toLowerCase());
}

// Convert empty strings to null.
function nullableString(value) {
  return value === undefined || value === null || value.trim() === ""
    ? null
    : value.trim();
}

// Main dataset import function.
export async function importDataset() {
  console.log("Reading CSV files...");

  const courses = readCsv("courses.csv");
  const faculty = readCsv("faculty.csv");
  const groups = readCsv("student_groups.csv");
  const rooms = readCsv("rooms.csv");
  const sessions = readCsv("sessions.csv");
  const exams = readCsv("exams.csv");
  const bookings = readCsv("booking_requests.csv");
  const cancellations = readCsv("cancellations.csv");
  const roomUnavailability = readCsv("room_unavailability.csv");

  console.log("CSV files read successfully.");

  // Import everything in one transaction.
  await prisma.$transaction(
    async (tx) => {
      // 1. DEPARTMENTS
      console.log("Importing departments...");

      const departmentCodes = new Set();

      for (const row of [...courses, ...faculty, ...groups, ...bookings]) {
        const code = nullableString(row.department);

        if (code) {
          departmentCodes.add(code);
        }
      }

      for (const code of departmentCodes) {
        await tx.department.upsert({
          where: { code },
          create: {
            code,
            name: code,
          },
          update: {},
        });
      }

      // 2. FACULTY
      console.log("Importing faculty...");

      for (const row of faculty) {
        const data = {
          name: row.name,
          departmentCode: row.department,
          maxHoursPerDay: toInt(row.max_hours_per_day, "max_hours_per_day"),
          needsAccessible: toBoolean(row.needs_accessible),
          unavailable: parseJson(row.unavailable),
          preferences: parseJson(row.preferences),
        };

        await tx.faculty.upsert({
          where: { id: row.id },
          create: {
            id: row.id,
            ...data,
          },
          update: data,
        });
      }

      // 3. COURSES
      console.log("Importing courses...");

      for (const row of courses) {
        const data = {
          title: row.title,
          departmentCode: row.department,
          year: toInt(row.year, "year"),
          lectureHours: toInt(row.lecture_hours, "lecture_hours"),
          tutorialHours: toInt(row.tutorial_hours, "tutorial_hours"),
          labBlocks: toInt(row.lab_blocks, "lab_blocks"),
        };

        await tx.course.upsert({
          where: { id: row.id },
          create: {
            id: row.id,
            ...data,
          },
          update: data,
        });
      }

      // 4. STUDENT GROUPS
      console.log("Importing student groups...");

      for (const row of groups) {
        const data = {
          name: row.name,
          year: toInt(row.year, "year"),
          departmentCode: row.department,
          size: toInt(row.size, "size"),
          needsAccessible: toBoolean(row.needs_accessible),
        };

        await tx.studentGroup.upsert({
          where: { id: row.id },
          create: {
            id: row.id,
            ...data,
          },
          update: data,
        });
      }

      // 5. ROOMS
      console.log("Importing rooms...");

      for (const row of rooms) {
        const data = {
          name: row.name,
          building: row.building,
          type: row.type,
          capacity: toInt(row.capacity, "capacity"),
          features: parseJson(row.features),
          accessible: toBoolean(row.accessible),
          allowedUses: parseJson(row.allowed_uses),
        };

        await tx.room.upsert({
          where: { id: row.id },
          create: {
            id: row.id,
            ...data,
          },
          update: data,
        });
      }

      // 6. TEACHING SESSIONS AND GROUP RELATIONSHIPS
      console.log("Importing teaching sessions...");

      for (const row of sessions) {
        const fixedSlot = nullableString(row.fixed_slot);

        const sessionData = {
          courseId: row.course_id,
          kind: row.kind,
          facultyId: row.faculty_id,
          size: toInt(row.size, "size"),
          duration: toInt(row.duration, "duration"),
          roomTypes: parseJson(row.room_types),
          needsAccessible: toBoolean(row.needs_accessible),
          basketSlot: nullableString(row.basket_slot),
        };

        if (fixedSlot) {
          sessionData.fixedSlot = parseJson(fixedSlot);
        }

        await tx.teachingSession.upsert({
          where: { id: row.id },
          create: {
            id: row.id,
            ...sessionData,
          },
          update: sessionData,
        });

        const groupIds = parseJson(row.groups);

        if (groupIds.length > 0) {
          await tx.sessionGroup.createMany({
            data: groupIds.map((groupId) => ({
              sessionId: row.id,
              groupId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // 7. EXAMS AND THEIR RELATIONSHIPS
      console.log("Importing examinations...");

      for (const row of exams) {
        const examData = {
          size: toInt(row.size, "size"),
          durationHours: toInt(row.duration_hours, "duration_hours"),
        };

        await tx.exam.upsert({
          where: { id: row.id },
          create: {
            id: row.id,
            ...examData,
          },
          update: examData,
        });

        const courseIds = parseJson(row.course_ids);
        const groupIds = parseJson(row.groups);

        if (courseIds.length > 0) {
          await tx.examCourse.createMany({
            data: courseIds.map((courseId) => ({
              examId: row.id,
              courseId,
            })),
            skipDuplicates: true,
          });
        }

        if (groupIds.length > 0) {
          await tx.examGroup.createMany({
            data: groupIds.map((groupId) => ({
              examId: row.id,
              groupId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // 8. BOOKING REQUESTS
      console.log("Importing booking requests...");

      for (const row of bookings) {
        // Correct the invalid room ID found in BR-14.
        const rawRequestedRoomId = nullableString(row.requested_room);

        const requestedRoomId =
          rawRequestedRoomId === "LHC-5" ? "LH-5" : rawRequestedRoomId;

        const bookingData = {
          submittedAt: new Date(row.submitted_at),
          requester: row.requester,
          role: row.role,
          departmentCode: nullableString(row.department),
          requestedCategory: row.requested_category,
          title: row.title,
          attendance: toInt(row.attendance, "attendance"),
          durationPeriods: toInt(row.duration_periods, "duration_periods"),
          windows: parseJson(row.windows),
          roomTypes: parseJson(row.room_types),
          needs: parseJson(row.needs),
          requestedRoomId,
          seriesId: nullableString(row.series_id),
          rawText: row.raw_text,
        };

        await tx.bookingRequest.upsert({
          where: { id: row.id },
          create: {
            id: row.id,
            ...bookingData,
          },
          update: bookingData,
        });

        // Mandatory student groups.
        const mandatoryGroupIds = parseJson(row.mandatory_for_groups);

        if (mandatoryGroupIds.length > 0) {
          await tx.bookingMandatoryGroup.createMany({
            data: mandatoryGroupIds.map((groupId) => ({
              bookingRequestId: row.id,
              groupId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // 9. CANCELLATIONS
      console.log("Importing cancellations...");

      for (const row of cancellations) {
        const cancellationData = {
          cancelledAt: new Date(row.cancelled_at),
          by: row.by,
          note: row.note,
        };

        await tx.cancellation.upsert({
          where: {
            requestId: row.request_id,
          },
          create: {
            requestId: row.request_id,
            ...cancellationData,
          },
          update: cancellationData,
        });
      }

      // 10. ROOM UNAVAILABILITY
      console.log("Importing room unavailability...");

      for (const row of roomUnavailability) {
        const periods = parseJson(row.periods);

        const existing = await tx.roomUnavailability.findFirst({
          where: {
            roomId: row.room_id,
            day: row.day,
            reason: row.reason,
          },
        });

        if (!existing) {
          await tx.roomUnavailability.create({
            data: {
              roomId: row.room_id,
              day: row.day,
              periods,
              reason: row.reason,
            },
          });
        }
      }
    },
    {
      maxWait: 10000,
      timeout: 120000,
    },
  );

  console.log("\nDataset import completed successfully!");

  console.log("\nSource CSV record counts:");

  console.table({
    courses: courses.length,
    faculty: faculty.length,
    studentGroups: groups.length,
    rooms: rooms.length,
    sessions: sessions.length,
    exams: exams.length,
    bookingRequests: bookings.length,
    cancellations: cancellations.length,
    roomUnavailability: roomUnavailability.length,
  });
}
