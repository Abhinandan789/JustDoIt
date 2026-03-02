import { formatForTimezone } from "@/lib/timezone";
import { Resend } from "resend";

type SendMissedEmailParams = {
  to: string;
  username: string;
  taskTitle: string;
  eodDeadline: Date;
  timezone: string;
};

type SendResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export async function sendMissedTaskEmail({
  to,
  username,
  taskTitle,
  eodDeadline,
  timezone,
}: SendMissedEmailParams): Promise<SendResult> {
  const resend = getResendClient();

  if (!resend) {
    return {
      ok: false,
      skipped: true,
      error: "RESEND_API_KEY is not configured",
    };
  }

  const deadlineLabel = formatForTimezone(eodDeadline, timezone, "p");
  const fromAddress = process.env.EMAIL_FROM ?? "Task Reminder <onboarding@resend.dev>";

  try {
    await resend.emails.send({
      from: fromAddress,
      to,
      subject: "Task Not Completed",
      text: [
        `Hello ${username},`,
        "",
        `You did not complete the task: "${taskTitle}".`,
        `Deadline was: ${deadlineLabel}.`,
        "Please review and complete the task.",
      ].join("\n"),
      html: `
        <p>Hello ${username},</p>
        <p>You did not complete the task: <strong>${taskTitle}</strong>.</p>
        <p>Deadline was: <strong>${deadlineLabel}</strong>.</p>
        <p>Please review and complete the task.</p>
      `,
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email failure",
    };
  }
}
