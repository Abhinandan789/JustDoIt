import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

async function main() {
  const email = "demo@example.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.user.create({
    data: {
      username: "demo",
      email,
      passwordHash,
      timezone: "UTC",
    },
  });
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
