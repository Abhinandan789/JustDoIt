import bcrypt from "bcryptjs";

import { verifyUserCredentials } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("authentication", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null for unknown users", async () => {
    vi.spyOn(prisma.user, "findFirst").mockResolvedValue(null as never);

    const result = await verifyUserCredentials("missing@example.com", "password123");

    expect(result).toBeNull();
  });

  it("returns user when password is valid", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);

    vi.spyOn(prisma.user, "findFirst").mockResolvedValue({
      id: "user_1",
      username: "demo",
      email: "demo@example.com",
      passwordHash,
      profileImage: null,
      timezone: "UTC",
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await verifyUserCredentials("demo@example.com", "password123");

    expect(result?.id).toBe("user_1");
  });
});
