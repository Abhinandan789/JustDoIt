import { addHours } from "date-fns";

import { createTaskAction } from "@/actions/task-actions";
import { TaskForm } from "@/components/TaskForm";
import { getRequiredUser } from "@/lib/auth";
import { toDateTimeLocalValue } from "@/utils/date";

export default async function NewTaskPage() {
  const user = await getRequiredUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create Task</h1>
      <TaskForm
        action={createTaskAction}
        submitLabel="Create Task"
        defaultValues={{
          eodDeadline: toDateTimeLocalValue(addHours(new Date(), 4), user.timezone),
        }}
      />
    </div>
  );
}

