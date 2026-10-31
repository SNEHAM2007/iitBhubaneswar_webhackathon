
import "dotenv/config";
import { prisma } from "../config/prisma.js";
import { importDataset } from "../services/datasetImport.service.js";

try {
  await importDataset();
} catch (error) {
  console.error("Dataset import failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
