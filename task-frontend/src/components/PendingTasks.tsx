import type { Task } from "../types/task.js";
import {
  TaskStatus,
  TaskPriority,
  normalizeTaskStatus,
  normalizeTaskPriority,
} from "../types/task.js";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, AlertTriangle, Calendar } from "lucide-react";

interface PendingTasksProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

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

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};

const isDueSoon = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
};

export function PendingTasks({ tasks, onEdit, onDelete }: PendingTasksProps) {
  const pendingTasks = tasks.filter(
    (task) => normalizeTaskStatus(task.status) === TaskStatus.Pending
  );

  if (pendingTasks.length === 0) {
    return null;
  }

  const overdueTasks = pendingTasks.filter(
    (task) => task.dueDate && isOverdue(task.dueDate)
  );

  const dueSoonTasks = pendingTasks.filter(
    (task) =>
      task.dueDate && isDueSoon(task.dueDate) && !isOverdue(task.dueDate)
  );

  return (
    <div className='space-y-6'>
      {/* Pending Tasks Header */}
      <div className='flex items-center gap-3'>
        <Clock className='h-6 w-6 text-yellow-600' />
        <h2 className='text-2xl font-bold text-gray-900'>
          Pending Tasks ({pendingTasks.length})
        </h2>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='text-lg text-red-800 flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Overdue Tasks ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {overdueTasks.map((task) => (
                <Card key={task.id} className='border-red-300 bg-red-100'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <CardTitle className='text-base font-semibold line-clamp-2 flex-1 mr-4'>
                        {task.title}
                      </CardTitle>
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onEdit(task)}
                          className='h-8 w-8 p-0'
                        >
                          <Clock className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onDelete(task.id)}
                          className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                          <AlertTriangle className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                    <div className='flex gap-2 flex-wrap'>
                      <Badge
                        className={getPriorityColor(
                          normalizeTaskPriority(task.priority)
                        )}
                      >
                        {getPriorityText(normalizeTaskPriority(task.priority))}
                      </Badge>
                      <Badge className='bg-red-100 text-red-800'>Overdue</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    {task.description && (
                      <p className='text-sm text-gray-700 mb-3 line-clamp-2'>
                        {task.description}
                      </p>
                    )}
                    <div className='text-xs text-red-600 font-medium'>
                      Due:{" "}
                      {task.dueDate &&
                        new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Due Soon Tasks */}
      {dueSoonTasks.length > 0 && (
        <Card className='border-orange-200 bg-orange-50'>
          <CardHeader>
            <CardTitle className='text-lg text-orange-800 flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Due Soon ({dueSoonTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {dueSoonTasks.map((task) => (
                <Card key={task.id} className='border-orange-300 bg-orange-100'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <CardTitle className='text-base font-semibold line-clamp-2 flex-1 mr-4'>
                        {task.title}
                      </CardTitle>
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onEdit(task)}
                          className='h-8 w-8 p-0'
                        >
                          <Clock className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onDelete(task.id)}
                          className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                          <AlertTriangle className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                    <div className='flex gap-2 flex-wrap'>
                      <Badge
                        className={getPriorityColor(
                          normalizeTaskPriority(task.priority)
                        )}
                      >
                        {getPriorityText(normalizeTaskPriority(task.priority))}
                      </Badge>
                      <Badge className='bg-orange-100 text-orange-800'>
                        Due Soon
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    {task.description && (
                      <p className='text-sm text-gray-700 mb-3 line-clamp-2'>
                        {task.description}
                      </p>
                    )}
                    <div className='text-xs text-orange-600 font-medium'>
                      Due:{" "}
                      {task.dueDate &&
                        new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Pending Tasks */}
      {pendingTasks.filter(
        (task) =>
          !task.dueDate ||
          (!isOverdue(task.dueDate) && !isDueSoon(task.dueDate))
      ).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Other Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {pendingTasks
                .filter(
                  (task) =>
                    !task.dueDate ||
                    (!isOverdue(task.dueDate) && !isDueSoon(task.dueDate))
                )
                .map((task) => (
                  <Card
                    key={task.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <CardTitle className='text-base font-semibold line-clamp-2 flex-1 mr-4'>
                          {task.title}
                        </CardTitle>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => onEdit(task)}
                            className='h-8 w-8 p-0'
                          >
                            <Clock className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => onDelete(task.id)}
                            className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                          >
                            <AlertTriangle className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex gap-2 flex-wrap'>
                        <Badge
                          className={getPriorityColor(
                            normalizeTaskPriority(task.priority)
                          )}
                        >
                          {getPriorityText(
                            normalizeTaskPriority(task.priority)
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      {task.description && (
                        <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                          {task.description}
                        </p>
                      )}
                      {task.dueDate && (
                        <div className='text-xs text-gray-500'>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
