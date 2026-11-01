import { prisma } from "../config/prisma.js";

function formatRoom(room) {
  const features = room.features || [];
  const isAvailable = !room.unavailabilities || room.unavailabilities.length === 0;

  return {
    id: room.id,
    name: room.name,
    roomNumber: room.name,
    building: room.building,
    location: room.building,
    type: room.type,
    category: room.type,
    capacity: room.capacity,
    features,
    accessible: room.accessible,
    allowedUses: room.allowedUses || [],
    unavailabilities: room.unavailabilities || [],
    isAvailable,
    available: isAvailable,
    hasProjector: features.some((f) => f.toLowerCase().includes("projector")),
    hasComputer: features.some(
      (f) =>
        f.toLowerCase().includes("computer") ||
        f.toLowerCase().includes("pc") ||
        f.toLowerCase().includes("lab"),
    ),
    hasSmartBoard: features.some(
      (f) =>
        f.toLowerCase().includes("smart") ||
        f.toLowerCase().includes("board") ||
        f.toLowerCase().includes("screen"),
    ),
  };
}

export const listRooms = async (req, res) => {
  try {
    const { type, availability, search } = req.query;

    const where = {};

    if (type && type !== "ALL") {
      where.type = { equals: type.toLowerCase(), mode: "insensitive" };
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { building: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        unavailabilities: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    let formattedRooms = rooms.map(formatRoom);

    if (availability === "AVAILABLE") {
      formattedRooms = formattedRooms.filter((r) => r.isAvailable);
    } else if (availability === "UNAVAILABLE") {
      formattedRooms = formattedRooms.filter((r) => !r.isAvailable);
    }

    return res.status(200).json({
      success: true,
      count: formattedRooms.length,
      rooms: formattedRooms,
    });
  } catch (error) {
    console.error("List rooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve campus rooms",
    });
  }
};

export const getRoomDetails = async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: {
        unavailabilities: true,
        scheduledSessions: {
          include: {
            session: {
              include: {
                course: true,
                faculty: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatRoom(room),
      room: formatRoom(room),
    });
  } catch (error) {
    console.error("Get room error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve room details",
    });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, building, type, capacity, features, accessible, allowedUses } =
      req.body;

    if (!name || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Room name and capacity are required",
      });
    }

    const roomId =
      req.body.id ||
      name.replace(/\s+/g, "-").toUpperCase() ||
      `ROOM-${Date.now()}`;

    const newRoom = await prisma.room.create({
      data: {
        id: roomId,
        name,
        building: building || "Academic Complex",
        type: (type || "classroom").toLowerCase(),
        capacity: Number(capacity) || 30,
        features: Array.isArray(features) ? features : ["projector"],
        accessible: Boolean(accessible ?? true),
        allowedUses: Array.isArray(allowedUses)
          ? allowedUses
          : ["lectures", "tutorials", "events"],
      },
      include: {
        unavailabilities: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: formatRoom(newRoom),
      data: formatRoom(newRoom),
    });
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create room",
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, building, type, capacity, features, accessible, allowedUses } =
      req.body;

    const data = {};
    if (name) data.name = name;
    if (building) data.building = building;
    if (type) data.type = type.toLowerCase();
    if (capacity !== undefined) data.capacity = Number(capacity);
    if (features) data.features = features;
    if (accessible !== undefined) data.accessible = Boolean(accessible);
    if (allowedUses) data.allowedUses = allowedUses;

    const updated = await prisma.room.update({
      where: { id },
      data,
      include: {
        unavailabilities: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room: formatRoom(updated),
      data: formatRoom(updated),
    });
  } catch (error) {
    console.error("Update room error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update room",
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.room.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete room",
    });
  }
};
