import { prisma } from "../config/prisma.js";

const dayOrder = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const dayNames = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};
const periodStarts = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

function periodRange(startPeriod, endPeriod) {
  if (
    !Number.isInteger(startPeriod) ||
    !Number.isInteger(endPeriod) ||
    startPeriod < 1 ||
    endPeriod < startPeriod ||
    endPeriod > periodStarts.length
  ) {
    return null;
  }

  const start = periodStarts[startPeriod - 1];
  const duration = endPeriod - startPeriod + 1;
  const [hours, minutes] = start.split(":").map(Number);
  const endMinutes = hours * 60 + minutes + duration * 60;

  return {
    start,
    end: `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(
      endMinutes % 60,
    ).padStart(2, "0")}`,
  };
}

function getScheduleScope(role, user) {
  if (role === "COORDINATOR") {
    return user.departmentCode
      ? (scheduled) =>
          scheduled.session.course.departmentCode === user.departmentCode
      : () => false;
  }

  if (role === "FACULTY") {
    return user.facultyId
      ? (scheduled) => scheduled.session.facultyId === user.facultyId
      : () => false;
  }

  return () => true;
}

function getBookingWhere(role, user) {
  if (role === "ADMIN") return {};
  if (role === "COORDINATOR") {
    return user.departmentCode
      ? { departmentCode: user.departmentCode }
      : { id: "__no_department_assigned__" };
  }

  return { requester: user.name };
}

function makeStats(role, counts) {
  if (role === "ADMIN") {
    return [
      {
        label: "Scheduled sessions",
        value: `${counts.scheduledSessions} / ${counts.totalSessions}`,
        note: counts.hasSchedule ? "Latest published schedule" : "No schedule generated yet",
        tone: "indigo",
      },
      {
        label: "Open booking requests",
        value: counts.openBookings,
        note: "Submitted and awaiting review",
        tone: "amber",
      },
      {
        label: "Campus rooms",
        value: counts.rooms,
        note: "Rooms in the campus directory",
        tone: "sky",
      },
      {
        label: "Faculty members",
        value: counts.faculty,
        note: "In the faculty directory",
        tone: "emerald",
      },
    ];
  }

  if (role === "COORDINATOR") {
    return [
      {
        label: "Department sessions",
        value: counts.scheduledSessions,
        note: counts.hasSchedule ? "In the latest schedule" : "No schedule generated yet",
        tone: "indigo",
      },
      {
        label: "Faculty members",
        value: counts.faculty,
        note: "In your department",
        tone: "sky",
      },
      {
        label: "Open requests",
        value: counts.openBookings,
        note: "For your department",
        tone: "amber",
      },
      {
        label: "Campus rooms",
        value: counts.rooms,
        note: "Rooms in the campus directory",
        tone: "emerald",
      },
    ];
  }

  if (role === "FACULTY") {
    return [
      {
        label: "Teaching sessions",
        value: counts.scheduledSessions,
        note: counts.hasSchedule ? "Assigned to your faculty profile" : "No schedule generated yet",
        tone: "indigo",
      },
      {
        label: "Assigned courses",
        value: counts.courses,
        note: "Across your scheduled sessions",
        tone: "sky",
      },
      {
        label: "Open requests",
        value: counts.openBookings,
        note: "Booking requests you submitted",
        tone: "amber",
      },
      {
        label: "Department",
        value: counts.departmentCode || "Not set",
        note: "Your account department",
        tone: "emerald",
      },
    ];
  }

  return [
    {
      label: "My requests",
      value: counts.totalBookings,
      note: "Room booking requests submitted",
      tone: "indigo",
    },
    {
      label: "Open requests",
      value: counts.openBookings,
      note: "Awaiting review",
      tone: "amber",
    },
    {
      label: "Cancelled requests",
      value: counts.cancelledBookings,
      note: "Requests with a cancellation record",
      tone: "rose",
    },
    {
      label: "Campus rooms",
      value: counts.rooms,
      note: "Rooms in the campus directory",
      tone: "emerald",
    },
  ];
}

export const getDashboardOverview = async (req, res) => {
  try {
    const role = req.user.role?.toUpperCase();
    const bookingWhere = getBookingWhere(role, req.user);
    const latestSchedule = await prisma.schedule.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { generatedAt: "desc" },
      include: {
        sessions: {
          include: {
            session: {
              include: {
                course: true,
                faculty: true,
                groups: { include: { group: true } },
              },
            },
            room: true,
          },
        },
      },
    });

    const scheduleSessions = latestSchedule?.sessions || [];
    const scopedScheduleSessions = scheduleSessions.filter(
      getScheduleScope(role, req.user),
    );
    const visibleSessions = scopedScheduleSessions
      .map((scheduled) => {
        const times = periodRange(
          scheduled.startPeriod,
          scheduled.endPeriod,
        );

        return {
          id: scheduled.id,
          day: dayNames[scheduled.day] || scheduled.day,
          dayCode: scheduled.day,
          dayOrder: dayOrder.indexOf(scheduled.day),
          time: times ? `${times.start} – ${times.end}` : "Time unavailable",
          startPeriod: scheduled.startPeriod,
          courseCode: scheduled.session.courseId,
          subject: scheduled.session.course.title,
          faculty: scheduled.session.faculty.name,
          room: scheduled.room.name,
          department: scheduled.session.course.departmentCode,
          groups: scheduled.session.groups.map(({ group }) => group.name),
        };
      })
      .sort(
        (first, second) =>
          first.dayOrder - second.dayOrder ||
          first.startPeriod - second.startPeriod,
      )
      .slice(0, 8);

    const [
      totalSessions,
      faculty,
      rooms,
      totalBookings,
      openBookings,
      cancelledBookings,
      bookings,
    ] = await Promise.all([
      role === "ADMIN"
        ? prisma.teachingSession.count()
        : Promise.resolve(0),
      role === "ADMIN"
        ? prisma.faculty.count()
        : role === "COORDINATOR" && req.user.departmentCode
          ? prisma.faculty.count({
              where: { departmentCode: req.user.departmentCode },
            })
          : Promise.resolve(0),
      role === "FACULTY"
        ? Promise.resolve(0)
        : prisma.room.count(),
      prisma.bookingRequest.count({ where: bookingWhere }),
      prisma.bookingRequest.count({
        where: {
          ...bookingWhere,
          cancellation: { is: null },
        },
      }),
      prisma.bookingRequest.count({
        where: {
          ...bookingWhere,
          cancellation: { isNot: null },
        },
      }),
      prisma.bookingRequest.findMany({
        where: bookingWhere,
        include: {
          requestedRoom: { select: { name: true } },
          cancellation: { select: { cancelledAt: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 6,
      }),
    ]);

    const distinctCourses = new Set(
      (latestSchedule?.sessions || [])
        .filter(getScheduleScope(role, req.user))
        .map((scheduled) => scheduled.session.courseId),
    );

    const counts = {
      hasSchedule: Boolean(latestSchedule),
      scheduledSessions:
        role === "ADMIN"
          ? scheduleSessions.length
          : scopedScheduleSessions.length,
      totalSessions,
      faculty,
      rooms,
      openBookings,
      cancelledBookings,
      totalBookings,
      courses: distinctCourses.size,
      departmentCode: req.user.departmentCode,
    };

    return res.status(200).json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          role,
          departmentCode: req.user.departmentCode,
          facultyLinked: Boolean(req.user.facultyId),
        },
        generatedAt: latestSchedule?.generatedAt || null,
        scheduleName: latestSchedule?.name || null,
        stats: makeStats(role, counts),
        sessions: visibleSessions,
        bookings: bookings.map((booking) => ({
          id: booking.id,
          title: booking.title,
          category: booking.requestedCategory,
          requester: booking.requester,
          submittedAt: booking.submittedAt,
          room: booking.requestedRoom?.name || "Room not selected",
          status: booking.cancellation ? "CANCELLED" : "SUBMITTED",
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};
