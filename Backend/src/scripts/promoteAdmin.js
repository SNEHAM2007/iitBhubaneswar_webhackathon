import { prisma } from "../config/prisma.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run admin:promote -- <existing-account-email>");
  process.exitCode = 1;
} else {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw new Error("No account exists with that email. Register a regular account first.");
    }

    if (!user.isActive) {
      throw new Error("Cannot grant admin access to an inactive account.");
    }

    if (user.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    }

    console.log(`Admin access enabled for ${user.email}.`);
  } catch (error) {
    console.error(`Admin provisioning failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
