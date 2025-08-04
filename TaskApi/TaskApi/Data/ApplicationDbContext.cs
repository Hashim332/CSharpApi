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
        public DbSet<TaskApi.Models.Task> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Task entity
            modelBuilder.Entity<TaskApi.Models.Task>(entity =>
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
                    .HasConversion<int>()
                    .IsRequired();

                entity.Property(e => e.Priority)
                    .HasConversion<int>()
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