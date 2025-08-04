using System;
using System.ComponentModel.DataAnnotations;

namespace TaskApi.Models
{
    public class TaskItem
    {
        // Primary key - EF Core convention
        public int Id { get; set; }

        // Required field with validation
        [Required]
        [StringLength(200, ErrorMessage = "Title cannot be longer than 200 characters")]
        public string Title { get; set; } = string.Empty;

        // Optional description
        [StringLength(1000, ErrorMessage = "Description cannot be longer than 1000 characters")]
        public string? Description { get; set; }

        // Enum for task status
        public TaskStatus Status { get; set; } = TaskStatus.Pending;

        // Priority level
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;

        // Timestamps (auto-managed by EF Core)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Due date (optional)
        public DateTime? DueDate { get; set; }
    }

    public enum TaskStatus
    {
        Pending,
        InProgress,
        Completed,
        Cancelled
    }

    public enum TaskPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    // DTO for creating tasks
    public class CreateTaskDto
    {
        [Required]
        [StringLength(200, ErrorMessage = "Title cannot be longer than 200 characters")]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot be longer than 1000 characters")]
        public string? Description { get; set; }

        public TaskStatus Status { get; set; } = TaskStatus.Pending;

        public TaskPriority Priority { get; set; } = TaskPriority.Medium;

        public string? DueDate { get; set; }
    }
}