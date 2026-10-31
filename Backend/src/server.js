import "dotenv/config";
import app from "./app.js";
import { prisma } from "./config/prisma.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connection before starting
    await prisma.$connect();

    console.log("PostgreSQL connected successfully");

    const server = app.listen(PORT, () => {
      console.log(`Campus Scheduler API running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        await prisma.$disconnect();
        console.log("Database disconnected");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Server startup failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
