
import { randomUUID } from "crypto";
import { prisma } from "../config/prisma.js";

// Create a new booking request
export const createBookingRequest = async (data) => {
  return prisma.bookingRequest.create({
    data: {
      id: randomUUID(),
      submittedAt: new Date(),
      requester: data.requester,
      role: data.role,
      departmentCode: data.departmentCode || null,
      requestedCategory: data.requestedCategory,
      title: data.title,
      attendance: data.attendance,
      durationPeriods: data.durationPeriods,
      windows: data.windows,
      roomTypes: data.roomTypes || [],
      needs: data.needs || [],
      requestedRoomId: data.requestedRoomId || null,
      seriesId: data.seriesId || null,
      rawText: data.rawText || "",
      mandatoryGroups: {
        create: (data.mandatoryGroupIds || []).map((groupId) => ({
          group: {
            connect: { id: groupId },
          },
        })),
      },
    },
    include: {
      requestedRoom: true,
      mandatoryGroups: {
        include: {
          group: true,
        },
      },
    },
  });
};

// Get booking requests
export const getBookingRequests = async (filters = {}) => {
  return prisma.bookingRequest.findMany({
    where: filters,
    include: {
      requestedRoom: true,
      department: true,
      mandatoryGroups: {
        include: {
          group: true,
        },
      },
      cancellation: true,
    },
    orderBy: {
      submittedAt: "desc",
    },
  });
};

// Get one booking request
export const getBookingRequestById = async (id) => {
  return prisma.bookingRequest.findUnique({
    where: { id },
    include: {
      requestedRoom: true,
      department: true,
      mandatoryGroups: {
        include: {
          group: true,
        },
      },
      cancellation: true,
    },
  });
};
