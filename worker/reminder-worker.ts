import cron from "node-cron";

import { workerTick } from "@/lib/reminder-jobs";

export function startReminderWorker() {
  cron.schedule("* * * * *", async () => {
    try {
      await workerTick(new Date());
    } catch (error) {
      console.error("[worker] Tick failed", error);
    }
  });
}

if (require.main === module) {
  console.log("[worker] Reminder worker started");
  startReminderWorker();
}
