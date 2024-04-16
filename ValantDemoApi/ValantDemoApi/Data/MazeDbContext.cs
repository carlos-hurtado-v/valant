using Microsoft.EntityFrameworkCore;
using ValantDemoApi.Data.Entities;

namespace ValantDemoApi.Data
{
  public class MazeDbContext : DbContext
  {
    public MazeDbContext()
    {
    }

    public MazeDbContext(DbContextOptions<MazeDbContext> options) : base(options)
    {
    }

    public DbSet<Maze> Mazes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Maze>().HasKey(x => x.Id);
      modelBuilder.Entity<Maze>().Property(x => x.Id).ValueGeneratedOnAdd();
      modelBuilder.Entity<Maze>().HasIndex(m => m.Name).IsUnique();
    }
  }
}
