using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        // GET: api/tasks/health
        [HttpGet("health")]
        public async Task<ActionResult<object>> GetHealth()
        {
            return Ok(new { status = "healthy" });
        }

        // GET: api/tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskApi.Models.Task>>> GetTasks()
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
        public async Task<ActionResult<TaskApi.Models.Task>> GetTask(int id)
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
        public async Task<ActionResult<TaskApi.Models.Task>> CreateTask([FromBody] CreateTaskDto taskDto)
        {
            try
            {
                // Validate model
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Create new task from DTO
                var task = new TaskApi.Models.Task
                {
                    Title = taskDto.Title,
                    Description = taskDto.Description,
                    Status = taskDto.Status,
                    Priority = taskDto.Priority,
                    CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                    UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc)
                };

                // Convert DueDate string to UTC DateTime if provided
                if (!string.IsNullOrEmpty(taskDto.DueDate) && DateTime.TryParse(taskDto.DueDate, out DateTime parsedDueDate))
                {
                    task.DueDate = DateTime.SpecifyKind(parsedDueDate, DateTimeKind.Utc);
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
        public async Task<IActionResult> UpdateTask(int id, TaskApi.Models.Task taskUpdate)
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

        [HttpGet("db-info")]
        public async Task<IActionResult> GetDatabaseInfo()
        {
            try
            {
                var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();
                var databaseName = connection.Database;
                await connection.CloseAsync();
                
                return Ok(new { 
                    DatabaseName = databaseName,
                    ConnectionString = _context.Database.GetConnectionString()?.Split(';').FirstOrDefault(s => s.StartsWith("Database="))
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}