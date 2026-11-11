
import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma.js";

import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import facultyAvailabilityRoutes from "./routes/facultyAvailability.routes.js";
import facultyAccountRoutes from "./routes/facultyAccount.routes.js";
import schedulingRoutes from "./routes/scheduling.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import roomRoutes from "./routes/room.routes.js";
import examRoutes from "./routes/exam.routes.js";
import reschedulingRoutes from "./routes/rescheduling.routes.js";
import assistantRoutes from "./routes/assistant.routes.js";

const app = express();

// Allowed frontend origins
const allowedOrigins = new Set([
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  "http://localhost:5173",
  "https://campusflow-frontend-43qu.onrender.com",
]);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (health checks, etc.)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (
        allowedOrigins.has(normalizedOrigin) ||
        normalizedOrigin.endsWith(".onrender.com") ||
        normalizedOrigin.includes("localhost")
      ) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/faculty-accounts", facultyAccountRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/faculty-availability", facultyAvailabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/scheduling", schedulingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/rescheduling", reschedulingRoutes);
app.use("/api/assistant", assistantRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Campus Scheduler API is running",
      database: "Connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(500).json({
      success: false,
      message: "API is running, but database connection failed",
      database: "Disconnected",
    });
  }
});

export default app;
