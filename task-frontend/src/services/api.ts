import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types/task.js";

const API_BASE_URL = "http://localhost:5013/api/tasks";

export class TaskApiService {
  static async getTasks(): Promise<Task[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  }

  static async getTask(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch task");
    }
    return response.json();
  }

  static async createTask(task: CreateTaskRequest): Promise<Task> {
    console.log("Sending task data to backend:", JSON.stringify(task, null, 2));

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response body:", errorText);
      throw new Error("Failed to create task");
    }
    return response.json();
  }

  static async updateTask(task: UpdateTaskRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
  }

  static async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  }
}
