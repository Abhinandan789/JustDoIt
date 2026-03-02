const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: sendMock,
    };

    constructor(key: string) {
      void key;
    }
  },
}));

import { sendMissedTaskEmail } from "@/lib/email";

describe("email sending logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.RESEND_API_KEY;
  });

  it("returns skipped result when api key is missing", async () => {
    const result = await sendMissedTaskEmail({
      to: "demo@example.com",
      username: "demo",
      taskTitle: "Finish report",
      eodDeadline: new Date("2026-03-02T10:00:00.000Z"),
      timezone: "UTC",
    });

    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends an email when api key is configured", async () => {
    process.env.RESEND_API_KEY = "test_key";
    sendMock.mockResolvedValue({ id: "email_1" });

    const result = await sendMissedTaskEmail({
      to: "demo@example.com",
      username: "demo",
      taskTitle: "Finish report",
      eodDeadline: new Date("2026-03-02T10:00:00.000Z"),
      timezone: "UTC",
    });

    expect(result.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Task Not Completed",
        to: "demo@example.com",
      }),
    );
  });
});
