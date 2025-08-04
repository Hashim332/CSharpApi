using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskApi.Data;
using TaskApi.Models;

namespace TaskApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            try
            {
                var tasks = await _context.Tasks
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        // GET: api/tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);

                if (task == null)
                {
                    return NotFound(new { error = "Task not found" });
                }

                return Ok(task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        // POST: api/tasks
        [HttpPost]
        public async Task<ActionResult<TaskItem>> CreateTask(CreateTaskDto createTaskDto)
        {
            try
            {
                // Validate model
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Create new task from DTO
                var task = new TaskItem
                {
                    Title = createTaskDto.Title,
                    Description = createTaskDto.Description,
                    Status = createTaskDto.Status,
                    Priority = createTaskDto.Priority,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Handle dueDate conversion
                if (!string.IsNullOrEmpty(createTaskDto.DueDate))
                {
                    if (DateTime.TryParse(createTaskDto.DueDate, out DateTime parsedDate))
                    {
                        task.DueDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
                    }
                }

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                // Return 201 Created with location header
                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        // PUT: api/tasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, TaskItem taskUpdate)
        {
            try
            {
                if (id != taskUpdate.Id)
                {
                    return BadRequest(new { error = "ID mismatch" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingTask = await _context.Tasks.FindAsync(id);
                if (existingTask == null)
                {
                    return NotFound(new { error = "Task not found" });
                }

                // Update properties
                existingTask.Title = taskUpdate.Title;
                existingTask.Description = taskUpdate.Description;
                existingTask.Status = taskUpdate.Status;
                existingTask.Priority = taskUpdate.Priority;
                existingTask.DueDate = taskUpdate.DueDate;
                existingTask.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        // DELETE: api/tasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound(new { error = "Task not found" });
                }

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }
    }
}