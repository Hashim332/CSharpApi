import { useState, useEffect } from "react";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types/task.js";
import {
  TaskStatus,
  TaskPriority,
  normalizeTaskStatus,
  normalizeTaskPriority,
} from "../types/task.js";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { CardContent, CardHeader, CardTitle } from "./ui/card";

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: CreateTaskRequest | UpdateTaskRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: "",
    description: "",
    status: TaskStatus.Pending,
    priority: TaskPriority.Medium,
    dueDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: normalizeTaskStatus(task.status),
        priority: normalizeTaskPriority(task.priority),
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      dueDate: formData.dueDate || undefined,
    };

    if (task) {
      onSubmit({ ...submitData, id: task.id } as UpdateTaskRequest);
    } else {
      onSubmit(submitData);
    }
  };

  const handleInputChange = (
    field: keyof CreateTaskRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-semibold'>
          {task ? "Edit Task" : "Create New Task"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title *</Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder='Enter task title'
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className='text-sm text-red-500'>{errors.title}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder='Enter task description (optional)'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formData.status.toString()}
                onValueChange={(value) =>
                  handleInputChange("status", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskStatus).map((status) => (
                    <SelectItem key={status} value={status.toString()}>
                      {status === TaskStatus.Pending && "Pending"}
                      {status === TaskStatus.InProgress && "In Progress"}
                      {status === TaskStatus.Completed && "Completed"}
                      {status === TaskStatus.Cancelled && "Cancelled"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='priority'>Priority</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) =>
                  handleInputChange("priority", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskPriority).map((priority) => (
                    <SelectItem key={priority} value={priority.toString()}>
                      {priority === TaskPriority.Low && "Low"}
                      {priority === TaskPriority.Medium && "Medium"}
                      {priority === TaskPriority.High && "High"}
                      {priority === TaskPriority.Critical && "Critical"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='dueDate'>Due Date</Label>
            <Input
              id='dueDate'
              type='date'
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
            />
          </div>

          <div className='flex gap-2 pt-2'>
            <Button type='submit' className='flex-1' disabled={isLoading}>
              {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}
