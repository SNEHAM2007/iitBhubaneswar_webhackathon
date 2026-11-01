import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_FILE = path.resolve(__dirname, "../../data/rescheduling_requests.json");
const DISRUPTION_FILE = path.resolve(
  __dirname,
  "../../../CrunchWeek_StarterPack/examples/sample_disruption.json",
);

function ensureStorageDir() {
  const dir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadInitialRequests() {
  ensureStorageDir();

  if (fs.existsSync(STORAGE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf-8"));
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.warn("Could not parse existing rescheduling storage:", err);
    }
  }

  // Pre-populate from sample_disruption.json if available
  const initial = [
    {
      id: "REQ-DISRUPT-01",
      title: "Faculty Emergency Leave - F07",
      requester: "Prof. Vikram Sarabhai (F07)",
      department: "CSE",
      currentDate: "Monday",
      currentTime: "08:00 – 18:00 (P1–P9)",
      requestedDate: "Online / Make-up Slots",
      requestedTime: "Flexible across week",
      room: "CR-101 / CR-102",
      reason: "Conference travel every Monday for the rest of the semester",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      disruptionType: "faculty_unavailable",
    },
    {
      id: "REQ-DISRUPT-02",
      title: "Room Maintenance - CR-102 Closed",
      requester: "Estate & Campus Maintenance",
      department: "Administration",
      currentDate: "Monday – Friday",
      currentTime: "Full Day (P1–P9)",
      requestedDate: "Alternative Classroom",
      requestedTime: "Match existing course schedule",
      room: "CR-102",
      reason: "Water leak, room closed for urgent structural repair",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      disruptionType: "room_unavailable",
    },
    {
      id: "REQ-DISRUPT-03",
      title: "Add Tutorial Session - CS202-T2",
      requester: "Dr. P. Raman (F06)",
      department: "CSE",
      currentDate: "Not yet scheduled",
      currentTime: "Unassigned",
      requestedDate: "Wednesday or Thursday",
      requestedTime: "11:00 – 12:00 (P4)",
      room: "CR-103 or LH-1",
      reason: "Additional problem-solving tutorial required for CSE-2 cohort",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      disruptionType: "add_session",
    },
  ];

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initial, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save initial rescheduling requests:", err);
  }

  return initial;
}

let memoryRequests = loadInitialRequests();

function saveRequests() {
  try {
    ensureStorageDir();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(memoryRequests, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save rescheduling requests to disk:", err);
  }
}

export const listReschedulingRequests = async (req, res) => {
  try {
    const { status, search } = req.query;

    let results = [...memoryRequests];

    if (status && status !== "ALL") {
      results = results.filter(
        (r) => (r.status || "PENDING").toUpperCase() === status.toUpperCase(),
      );
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.requester.toLowerCase().includes(q) ||
          (r.department && r.department.toLowerCase().includes(q)) ||
          (r.room && r.room.toLowerCase().includes(q)),
      );
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      requests: results,
      data: results,
    });
  } catch (error) {
    console.error("List rescheduling requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve rescheduling requests",
    });
  }
};

export const getReschedulingRequestById = async (req, res) => {
  try {
    const request = memoryRequests.find((r) => r.id === req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Rescheduling request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
      request,
    });
  } catch (error) {
    console.error("Get rescheduling request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve rescheduling request details",
    });
  }
};

export const createReschedulingRequest = async (req, res) => {
  try {
    const {
      title,
      requester,
      department,
      currentDate,
      currentTime,
      requestedDate,
      requestedTime,
      room,
      reason,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Request title is required",
      });
    }

    const newRequest = {
      id: `REQ-${Date.now()}`,
      title,
      requester: requester || req.user.name,
      department: department || req.user.departmentCode || "General",
      currentDate: currentDate || "Current Week",
      currentTime: currentTime || "Standard Time",
      requestedDate: requestedDate || "Upcoming Week",
      requestedTime: requestedTime || "Flexible",
      room: room || "Any suitable room",
      reason: reason || "Schedule adjustment requested",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    memoryRequests.unshift(newRequest);
    saveRequests();

    return res.status(201).json({
      success: true,
      message: "Rescheduling request submitted successfully",
      request: newRequest,
      data: newRequest,
    });
  } catch (error) {
    console.error("Create rescheduling request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create rescheduling request",
    });
  }
};

export const approveReschedulingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryRequests.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Rescheduling request not found",
      });
    }

    memoryRequests[index].status = "APPROVED";
    memoryRequests[index].reviewedAt = new Date().toISOString();
    memoryRequests[index].reviewedBy = req.user.name;
    saveRequests();

    return res.status(200).json({
      success: true,
      message: "Rescheduling request approved successfully",
      request: memoryRequests[index],
      data: memoryRequests[index],
    });
  } catch (error) {
    console.error("Approve rescheduling request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve request",
    });
  }
};

export const rejectReschedulingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const index = memoryRequests.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Rescheduling request not found",
      });
    }

    memoryRequests[index].status = "REJECTED";
    memoryRequests[index].rejectionReason = reason || "Request cannot be accommodated";
    memoryRequests[index].reviewedAt = new Date().toISOString();
    memoryRequests[index].reviewedBy = req.user.name;
    saveRequests();

    return res.status(200).json({
      success: true,
      message: "Rescheduling request rejected",
      request: memoryRequests[index],
      data: memoryRequests[index],
    });
  } catch (error) {
    console.error("Reject rescheduling request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject request",
    });
  }
};
