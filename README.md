# C# .NET Task Management API - Complete Implementation Guide

I'm using the plan below to learn C# after several iterations with Claude. I landed on this comprehensive guide to build a complete Task Management API.

> **Goal:** Build a simple Task Management API in 4 hours  
> **Audience:** Node.js developer learning C# and PostgreSQL  
> **Scope:** Single entity CRUD API with enterprise patterns  
> **Deployment:** Railway with PostgreSQL addon

## Table of Contents

- [Project Overview](#project-overview)
- [Hour 1: Project Setup](#hour-1-project-setup)
- [Hour 2: Core Implementation](#hour-2-core-implementation)
- [Hour 3: Database & Testing](#hour-3-database--testing)
- [Hour 4: Deployment](#hour-4-deployment)
- [Reference Materials](#reference-materials)
- [Troubleshooting](#troubleshooting)

## Project Overview

This guide walks you through building a complete Task Management API using C# .NET 8, Entity Framework Core, and PostgreSQL. You'll learn enterprise patterns commonly used in production C# applications.

### What You'll Build

A RESTful API with these endpoints:

- `GET /api/tasks` - List all tasks
- `GET /api/tasks/{id}` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update existing task
- `DELETE /api/tasks/{id}` - Delete task

### Project Structure

```
TaskApi/
├── Controllers/
│   └── TasksController.cs
├── Models/
│   └── Task.cs
├── Data/
│   └── ApplicationDbContext.cs
├── Program.cs
├── appsettings.json
└── README.md
```

---

## Hour 1: Project Setup

### 1.1 Environment Setup

#### PostgreSQL Installation (Mac)

```bash
# Install PostgreSQL via Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add PostgreSQL to your PATH (add to ~/.zshrc)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Create a database user (replace 'yourusername' with your actual username)
createuser -s yourusername

# Create the database
createdb taskapi_dev
```

**Validation:** Test connection with `psql -d taskapi_dev -c "SELECT version();"`

#### .NET 8 SDK Installation

```bash
# Install .NET 8 SDK
brew install dotnet

# Verify installation
dotnet --versionŸ
# Should output: 8.0.x
```

### 1.2 Project Creation

```bash
# Create new directory and navigate to it
mkdir TaskApi
cd TaskApi

# Create new Web API project
dotnet new webapi -n TaskApi

# Navigate into project directory
cd TaskApi

# Verify project structure
ls -la
```

**Expected Output:**

```
Controllers/  Properties/  appsettings.json  Program.cs  TaskApi.csproj
```

### 1.3 Install Required NuGet Packages

```bash
# Entity Framework Core for PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL

# For API documentation
dotnet add package Swashbuckle.AspNetCore
```

### 1.4 Verify Setup

```bash
# Build the project
dotnet build

# Run the project (should start on https://localhost:7000)
dotnet run
```

**Checkpoint:** Visit `https://localhost:7000/swagger` to see the default Swagger UI.

---

## Hour 2: Core Implementation

### 2.1 Create the Task Entity Model

Create `Models/Task.cs`:

```csharp
using System.ComponentModel.DataAnnotations;

namespace TaskApi.Models
{
    public class Task
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
}
```

**C# Concepts Explained:**

- `[Required]` and `[StringLength]` are **Data Annotations** for validation
- `public int Id { get; set; }` follows EF Core convention for primary keys
- `DateTime.UtcNow` stores timestamps in UTC (best practice)
- Enums provide type safety for status and priority values

### 2.2 Create Database Context

Create `Data/ApplicationDbContext.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using TaskApi.Models;

namespace TaskApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSet represents a table in the database
        public DbSet<Task> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Task entity
            modelBuilder.Entity<Task>(entity =>
            {
                // Set table name
                entity.ToTable("Tasks");

                // Configure primary key
                entity.HasKey(e => e.Id);

                // Configure required fields
                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                // Configure enums
                entity.Property(e => e.Status)
                    .HasConversion<string>()
                    .IsRequired();

                entity.Property(e => e.Priority)
                    .HasConversion<string>()
                    .IsRequired();

                // Configure timestamps
                entity.Property(e => e.CreatedAt)
                    .IsRequired();

                // Add indexes for better performance
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Priority);
                entity.HasIndex(e => e.CreatedAt);
            });
        }
    }
}
```

**EF Core Concepts:**

- `DbContext` manages database connections and entity tracking
- `DbSet<T>` represents a database table
- `OnModelCreating` configures entity relationships and constraints
- `HasConversion<string>()` stores enums as strings in the database

### 2.3 Create API Controller

Create `Controllers/TasksController.cs`:

```csharp
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

        // GET: api/tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Task>>> GetTasks()
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
        public async Task<ActionResult<Task>> GetTask(int id)
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
        public async Task<ActionResult<Task>> CreateTask(Task task)
        {
            try
            {
                // Validate model
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Set creation timestamp
                task.CreatedAt = DateTime.UtcNow;
                task.UpdatedAt = DateTime.UtcNow;

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
        public async Task<IActionResult> UpdateTask(int id, Task taskUpdate)
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
```

**ASP.NET Core Concepts:**

- `[ApiController]` enables automatic model validation
- `[Route("api/[controller]")]` creates RESTful routing
- `ControllerBase` provides common controller functionality
- `async/await` for non-blocking database operations
- HTTP status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)

### 2.4 Configure Application

Update `Program.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using TaskApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext with PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
```

Update `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=taskapi_dev;Username=yourusername;Password="
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**Configuration Concepts:**

- `AddDbContext` registers the database context with dependency injection
- `UseNpgsql` configures Entity Framework for PostgreSQL
- `AddCors` enables cross-origin requests for frontend integration
- Connection string format: `Host=server;Database=dbname;Username=user;Password=pwd`

---

## Hour 3: Database & Testing

### 3.1 Database Migration

```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Apply migration to database
dotnet ef database update

# Verify migration
dotnet ef migrations list
```

**Expected Output:**

```
Build started...
Build succeeded.
Done. To undo this action, use 'ef migrations remove'
```

### 3.2 Test the API

#### Start the Application

```bash
dotnet run
```

Visit `https://localhost:7000/swagger` to see the interactive API documentation.

#### Manual Testing with curl

```bash
# Create a task
curl -X POST "https://localhost:7000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn C# API Development",
    "description": "Build a complete task management API",
    "status": "InProgress",
    "priority": "High"
  }'

# Get all tasks
curl -X GET "https://localhost:7000/api/tasks"

# Get specific task (replace {id} with actual ID)
curl -X GET "https://localhost:7000/api/tasks/1"

# Update a task
curl -X PUT "https://localhost:7000/api/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "title": "Learn C# API Development - Updated",
    "description": "Build a complete task management API with PostgreSQL",
    "status": "Completed",
    "priority": "High"
  }'

# Delete a task
curl -X DELETE "https://localhost:7000/api/tasks/1"
```

### 3.3 Database Verification

```bash
# Connect to PostgreSQL
psql -d taskapi_dev

# List tables
\dt

# View task data
SELECT * FROM "Tasks";

# Exit PostgreSQL
\q
```

---

## Hour 4: Deployment

### 4.1 Railway Setup

#### Create Railway Account

1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

#### Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Task Management API"

# Add Railway remote (replace with your project URL)
git remote add origin https://railway.app/project/your-project-id

# Push to Railway
git push -u origin main
```

### 4.2 PostgreSQL Addon

1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Wait for provisioning
4. Copy the connection string from the PostgreSQL service

### 4.3 Environment Configuration

In Railway dashboard:

1. Go to your API service
2. Click "Variables" tab
3. Add environment variable:

```
DATABASE_URL=postgresql://username:password@host:port/database
```

Update `Program.cs` to use Railway's environment variable:

```csharp
// Replace the existing DbContext configuration with:
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
        ?? builder.Configuration.GetConnectionString("DefaultConnection");

    options.UseNpgsql(connectionString);
});
```

### 4.4 Deploy and Test

```bash
# Push changes
git add .
git commit -m "Configure for Railway deployment"
git push

# Check deployment status in Railway dashboard
```

#### Post-Deploy Testing

```bash
# Test live endpoints (replace with your Railway URL)
curl -X GET "https://your-app-name.railway.app/api/tasks"

# Create a test task
curl -X POST "https://your-app-name.railway.app/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Deployed to Railway",
    "description": "Successfully deployed C# API to production",
    "status": "Completed",
    "priority": "High"
  }'
```

---

## Reference Materials

### C# Conventions

#### Naming Conventions

- **Classes:** PascalCase (`Task`, `ApplicationDbContext`)
- **Methods:** PascalCase (`GetTasks`, `CreateTask`)
- **Properties:** PascalCase (`Title`, `CreatedAt`)
- **Private fields:** camelCase with underscore (`_context`)
- **Constants:** UPPER_CASE (`MAX_TITLE_LENGTH`)

#### File Organization

```
Controllers/     # API endpoints
Models/         # Entity classes
Data/           # Database context
Services/       # Business logic (future)
DTOs/           # Data transfer objects (future)
```

### Entity Framework Core

#### Key Concepts

- **DbContext:** Database session and entity tracking
- **DbSet:** Represents a database table
- **Migration:** Database schema changes
- **Entity:** C# class mapped to database table

#### Common Commands

```bash
# Create migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Remove last migration
dotnet ef migrations remove

# Generate SQL script
dotnet ef migrations script

# Update database from specific migration
dotnet ef database update MigrationName
```

### PostgreSQL Basics

#### Connection String Format

```
Host=hostname;Database=dbname;Username=user;Password=pwd;Port=5432
```

#### Common Commands

```bash
# Connect to database
psql -d database_name -U username

# List databases
\l

# List tables
\dt

# Describe table
\d table_name

# Exit
\q
```

### HTTP Status Codes

| Code | Meaning               | Usage                         |
| ---- | --------------------- | ----------------------------- |
| 200  | OK                    | Successful GET request        |
| 201  | Created               | Successful POST request       |
| 204  | No Content            | Successful PUT/DELETE request |
| 400  | Bad Request           | Invalid input data            |
| 404  | Not Found             | Resource doesn't exist        |
| 500  | Internal Server Error | Server-side error             |

---

## Troubleshooting

### Common Issues

#### PostgreSQL Connection Issues

**Error:** `connection to server at "localhost" (127.0.0.1), port 5432 failed`

**Solution:**

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if stopped
brew services start postgresql@15

# Verify connection
psql -d taskapi_dev -c "SELECT 1;"
```

#### Migration Errors

**Error:** `No database provider has been configured`

**Solution:**

```bash
# Ensure Npgsql package is installed
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL

# Verify connection string in appsettings.json
# Rebuild project
dotnet build
```

#### Railway Deployment Issues

**Error:** `Build failed`

**Solution:**

1. Check Railway logs for specific error
2. Ensure all NuGet packages are in `.csproj`
3. Verify `Program.cs` has correct configuration
4. Check environment variables in Railway dashboard

#### CORS Issues

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**

```csharp
// In Program.cs, update CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.AllowAnyOrigin()  // For development only
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
```

### Performance Tips

1. **Use async/await** for all database operations
2. **Add indexes** for frequently queried columns
3. **Implement pagination** for large datasets
4. **Use DTOs** to limit data transfer
5. **Enable connection pooling** in production

### Security Best Practices

1. **Validate input** using Data Annotations
2. **Use HTTPS** in production
3. **Implement authentication** for sensitive endpoints
4. **Sanitize user input** to prevent SQL injection
5. **Use environment variables** for sensitive configuration

---

## Quick Reference

### Command Cheatsheet

```bash
# Development
dotnet run                    # Start development server
dotnet build                  # Build project
dotnet test                   # Run tests

# Database
dotnet ef migrations add X    # Create migration
dotnet ef database update     # Apply migrations
dotnet ef database drop       # Drop database

# Git
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push                      # Push to remote

# PostgreSQL
psql -d database_name         # Connect to database
\dt                          # List tables
\q                           # Exit psql
```

### Endpoint Reference

| Method | Endpoint          | Description       | Request Body |
| ------ | ----------------- | ----------------- | ------------ |
| GET    | `/api/tasks`      | List all tasks    | None         |
| GET    | `/api/tasks/{id}` | Get specific task | None         |
| POST   | `/api/tasks`      | Create new task   | Task object  |
| PUT    | `/api/tasks/{id}` | Update task       | Task object  |
| DELETE | `/api/tasks/{id}` | Delete task       | None         |

### Environment Setup Checklist

- [ ] PostgreSQL installed and running
- [ ] .NET 8 SDK installed
- [ ] Project created with `dotnet new webapi`
- [ ] Required NuGet packages installed
- [ ] Database context configured
- [ ] Connection string set in `appsettings.json`
- [ ] Initial migration created and applied
- [ ] API endpoints implemented and tested
- [ ] Railway account created
- [ ] PostgreSQL addon added to Railway project
- [ ] Environment variables configured
- [ ] Application deployed and tested

---

## Next Steps

After completing this guide, consider exploring:

1. **Authentication & Authorization** with JWT tokens
2. **Data Transfer Objects (DTOs)** for API responses
3. **Repository Pattern** for data access abstraction
4. **Unit Testing** with xUnit
5. **Logging** with Serilog
6. **API Versioning** for production APIs
7. **Rate Limiting** for API protection
8. **Health Checks** for monitoring

---

**Congratulations!** You've successfully built a production-ready C# .NET API with PostgreSQL. This foundation will serve you well as you continue your C# development journey.
