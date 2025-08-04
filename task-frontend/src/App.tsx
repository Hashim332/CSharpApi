import { useState, useEffect } from "react";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "./types/task.js";
import { TaskApiService } from "./services/api";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "./components/ui/dialog";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await TaskApiService.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(
        "Failed to fetch tasks. Please check if the backend is running."
      );
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    try {
      setIsSubmitting(true);
      const newTask = await TaskApiService.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      setIsFormOpen(false);
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error("Error creating task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskData: UpdateTaskRequest) => {
    try {
      setIsSubmitting(true);
      await TaskApiService.updateTask(taskData);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskData.id
            ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
            : task
        )
      );
      setEditingTask(null);
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error("Error updating task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await TaskApiService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error("Error deleting task:", err);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = (
    taskData: CreateTaskRequest | UpdateTaskRequest
  ) => {
    if ("id" in taskData) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4 text-blue-600' />
          <p className='text-gray-600'>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Task Manager</h1>
              <p className='text-gray-600 mt-1'>
                Manage your tasks efficiently
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  <DialogTitle className='sr-only'>
                    {editingTask ? "Edit Task" : "Add New Task"}
                  </DialogTitle>
                  <TaskForm
                    task={editingTask || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    isLoading={isSubmitting}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant='outline'
                onClick={fetchTasks}
                disabled={loading}
                className='flex items-center gap-2'
              >
                <RefreshCw className='h-4 w-4' />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-red-600' />
              <p className='text-red-800'>{error}</p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setError(null)}
              className='mt-2'
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className='text-center py-12'>
            <div className='max-w-md mx-auto'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No tasks yet
              </h3>
              <p className='text-gray-600'>
                Click the "Add Task" button in the header to create your first
                task.
              </p>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
