export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus | string;
  priority: TaskPriority | string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
}

export const TaskStatus = {
  Pending: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
} as const;

export const TaskPriority = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

// Helper function to normalize status values
export function normalizeTaskStatus(status: TaskStatus | string): TaskStatus {
  if (typeof status === "number") {
    return status as TaskStatus;
  }

  switch (status) {
    case "Pending":
      return TaskStatus.Pending;
    case "InProgress":
      return TaskStatus.InProgress;
    case "Completed":
      return TaskStatus.Completed;
    case "Cancelled":
      return TaskStatus.Cancelled;
    default:
      return TaskStatus.Pending;
  }
}

// Helper function to normalize priority values
export function normalizeTaskPriority(
  priority: TaskPriority | string
): TaskPriority {
  if (typeof priority === "number") {
    return priority as TaskPriority;
  }

  switch (priority) {
    case "Low":
      return TaskPriority.Low;
    case "Medium":
      return TaskPriority.Medium;
    case "High":
      return TaskPriority.High;
    case "Critical":
      return TaskPriority.Critical;
    default:
      return TaskPriority.Medium;
  }
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
}
