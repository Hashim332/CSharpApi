import type { Task } from "../types/task.js";
import { TaskStatus, TaskPriority } from "../types/task.js";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.Pending:
      return "bg-yellow-100 text-yellow-800";
    case TaskStatus.InProgress:
      return "bg-blue-100 text-blue-800";
    case TaskStatus.Completed:
      return "bg-green-100 text-green-800";
    case TaskStatus.Cancelled:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.Low:
      return "bg-gray-100 text-gray-800";
    case TaskPriority.Medium:
      return "bg-blue-100 text-blue-800";
    case TaskPriority.High:
      return "bg-orange-100 text-orange-800";
    case TaskPriority.Critical:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.Pending:
      return "Pending";
    case TaskStatus.InProgress:
      return "InProgress";
    case TaskStatus.Completed:
      return "Completed";
    case TaskStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
};

const getPriorityText = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.Low:
      return "Low";
    case TaskPriority.Medium:
      return "Medium";
    case TaskPriority.High:
      return "High";
    case TaskPriority.Critical:
      return "Critical";
    default:
      return "Unknown";
  }
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 mr-4">
            {task.title}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className={getStatusColor(task.status)}>
            {getStatusText(task.status)}
          </Badge>
          <Badge className={getPriorityColor(task.priority)}>
            {getPriorityText(task.priority)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {task.description}
          </p>
        )}
        <div className="text-xs text-gray-500">
          Created: {new Date(task.createdAt).toLocaleDateString()}
          {task.dueDate && (
            <span className="ml-4">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
