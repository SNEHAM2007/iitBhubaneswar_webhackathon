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

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Health check API
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
