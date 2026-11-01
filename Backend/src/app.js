
import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma.js";

// ==================================
// ROUTE IMPORTS
// ==================================
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import facultyAvailabilityRoutes from "./routes/facultyAvailability.routes.js";
import facultyAccountRoutes from "./routes/facultyAccount.routes.js";

// ==================================
// EXPRESS APP
// ==================================

const app = express();

// ==================================
// MIDDLEWARE
// ==================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==================================
// ROOT API
// ==================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to Campus Scheduler API",
  });
});

// ==================================
// HEALTH CHECK
// ==================================

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: "Campus Scheduler API is running",
      database: "Connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return res.status(503).json({
      success: false,
      message: "Database connection failed",
      database: "Disconnected",
    });
  }
});

// ==================================
// AUTHENTICATION ROUTES
// ==================================

app.use("/api/auth", authRoutes);

// ==================================
// ADMIN ROUTES
// ==================================

app.use("/api/admin", adminRoutes);

// ==================================
// FACULTY ACCOUNT MANAGEMENT ROUTES
// ==================================

app.use("/api/admin/faculty-accounts", facultyAccountRoutes);

// ==================================
// DEPARTMENT ROUTES
// ==================================

app.use("/api/departments", departmentRoutes);

// ==================================
// FACULTY ROUTES
// ==================================

app.use("/api/faculty", facultyRoutes);

// ==================================
// FACULTY AVAILABILITY ROUTES
// ==================================

app.use("/api/faculty-availability", facultyAvailabilityRoutes);
// ==================================
// BOOKING MANAGEMENT ROUTES
// ==================================

app.use("/api/bookings", bookingRoutes);

// ==================================
// 404 HANDLER
// ==================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ==================================
// GLOBAL ERROR HANDLER
// ==================================

app.use((error, req, res, next) => {
  console.error("Global API Error:", error);

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

// ==================================
// EXPORT APP
// ==================================

export default app;
