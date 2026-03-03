"use client";

import { TaskPriority } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { updateTaskAction } from "@/actions/task-actions";
import { TaskForm } from "@/components/TaskForm";
import { buttonClass } from "@/lib/button-styles";
import { toDateTimeLocalValue } from "@/utils/date";
import { cn } from "@/utils/format";

type EditTaskModalProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: TaskPriority;
    eodDeadline: Date;
  };
  timezone: string;
};

export function EditTaskModal({ task, timezone }: EditTaskModalProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openModal = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setIsMounted(true);
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const closeModal = useCallback(
    (afterClose?: () => void) => {
      setIsVisible(false);

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }

      closeTimerRef.current = setTimeout(() => {
        setIsMounted(false);
        closeTimerRef.current = null;
        if (afterClose) {
          afterClose();
        }
      }, 220);
    },
    [],
  );

  const handleSuccess = useCallback(() => {
    closeModal(() => router.refresh());
  }, [closeModal, router]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [closeModal, isMounted]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const localDeadline = useMemo(() => toDateTimeLocalValue(task.eodDeadline, timezone), [task.eodDeadline, timezone]);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={buttonClass("secondary", "px-3 py-2 text-sm font-medium")}
      >
        Edit
      </button>

      {isMounted
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200">
              <button
                type="button"
                aria-label="Close edit task modal"
                onClick={() => closeModal()}
                className={cn(
                  "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
                  isVisible ? "opacity-100" : "opacity-0",
                )}
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`edit-task-title-${task.id}`}
                className="relative z-10 w-full max-w-2xl"
              >
                <div
                  onClick={(event) => event.stopPropagation()}
                  className={cn(
                    "rounded-xl border border-gray-200 bg-white p-4 shadow-lg transition-all duration-200 ease-out dark:border-[#2a2a2a] dark:bg-[#1f1f1f]",
                    isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
                  )}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 id={`edit-task-title-${task.id}`} className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Edit Task
                    </h2>
                    <button
                      type="button"
                      onClick={() => closeModal()}
                      className={buttonClass("secondary", "px-2 py-1 text-sm font-semibold")}
                    >
                      Close
                    </button>
                  </div>

                  <TaskForm
                    action={updateTaskAction}
                    submitLabel="Save Changes"
                    onSuccess={handleSuccess}
                    defaultValues={{
                      id: task.id,
                      title: task.title,
                      description: task.description,
                      priority: task.priority,
                      eodDeadline: localDeadline,
                    }}
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

