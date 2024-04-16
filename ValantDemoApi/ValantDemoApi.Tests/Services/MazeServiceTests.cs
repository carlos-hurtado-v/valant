using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using NUnit.Framework;
using ValantDemoApi.Data.Entities;
using ValantDemoApi.Data;
using ValantDemoApi.Services;
using System.Linq;
using ValantDemoApi.Models;

namespace ValantDemoApi.Tests.Services
{
  [TestFixture]
  public class MazeServiceTests
  {
    private MazeDbContext _context;
    private MazeService _service;
    private IMemoryCache _cache;

    [SetUp]
    public void Setup()
    {
      var options = new DbContextOptionsBuilder<MazeDbContext>()
        .UseInMemoryDatabase(databaseName: "MazeTestDb")
        .Options;

      _context = new MazeDbContext(options);
      _cache = new Microsoft.Extensions.Caching.Memory.MemoryCache(new MemoryCacheOptions());
      _service = new MazeService(_context, _cache);

      _context.Database.EnsureDeleted();
      _context.Database.EnsureCreated();
    }

    [TearDown]
    public void TearDown()
    {
      _context.Dispose(); 
    }

    [Test]
    public async Task GetMazeAsync_ReturnsMaze_WhenExists()
    {
      var expectedMaze = new Maze { Id = 1, Name = "Test Maze", Definition = "SOOO\nOOOO\nOOEO\nOOOO" };
      _context.Mazes.Add(expectedMaze);
      await _context.SaveChangesAsync();

      var result = await _service.GetMazeAsync(1);
      Assert.AreEqual("Test Maze", result.Name);
    }

    [Test]
    public async Task CreateMazeAsync_CreatesValidMaze()
    {
      var maze = await _service.CreateMazeAsync("Maze1", "SOOO\nOOOO\nOOEO\nOOOO");
      Assert.AreEqual("Maze1", maze.Name);
      Assert.AreEqual("SOOO\nOOOO\nOOEO\nOOOO", maze.Definition);
      Assert.IsTrue(_context.Mazes.Any(x => x.Name == "Maze1"));
    }

    [Test]
    public async Task ValidateMaze_ReturnsSuccess_WhenMazeIsValid()
    {
      var result = await _service.ValidateMaze("Valid Maze", new[] { "SOOO", "OOOO", "OOEO", "OOOO" });
      Assert.IsTrue(result.Success);
      Assert.IsNull(result.Message);
    }

    [Test]
    public async Task ValidateMaze_ReturnsError_WhenMazeIsNotSolvable()
    {
      var result = await _service.ValidateMaze("Valid Maze", new[] { "SOOO", "XXXX", "OOEO", "OOOO" });
      Assert.IsFalse(result.Success);
      Assert.AreEqual("Maze is not solvable.", result.Message);
    }

    [Test]
    public async Task ValidateMaze_ReturnsError_WhenMazeHasNoEntry()
    {
      var result = await _service.ValidateMaze("Valid Maze", new[] { "OOOO", "XXXX", "OOEO", "OOOO" });
      Assert.IsFalse(result.Success);
      Assert.AreEqual("Maze must have exactly one entry point.", result.Message);
    }

    [Test]
    public async Task ValidateMaze_ReturnsError_WhenMazeHasNoExit()
    {
      var result = await _service.ValidateMaze("Valid Maze", new[] { "OOOO", "XXXXX", "OOSO", "OOOO" });
      Assert.IsFalse(result.Success);
      Assert.AreEqual("Maze must have exactly one exit point.", result.Message);
    }

    [Test]
    public async Task GetAvailableMovesAsync_ReturnsCorrectMoves()
    {
      var maze = new Maze { Id = 1, Name = "Test Maze", Definition = "SOOO\nOOOO\nOOEO\nOOOO" };
      _context.Mazes.Add(maze);
      await _context.SaveChangesAsync();

      var result = await _service.GetAvailableMovesAsync(new PlayerState { MazeId = 1, X = 0, Y = 1 });

      Assert.Contains("down", result.Moves);
      Assert.Contains("right", result.Moves);
      Assert.IsFalse(result.IsFinished);
    }

    [Test]
    public async Task GetAvailableMovesAsync_IndicatesCompletion_WhenOnExit()
    {
      var maze = new Maze { Id = 1, Name = "Test Maze", Definition = "SOOO\nOOOO\nOOEO\nOOOO" };
      _context.Mazes.Add(maze);
      await _context.SaveChangesAsync();

      var result = await _service.GetAvailableMovesAsync(new PlayerState { MazeId = 1, X = 2, Y = 2 });

      Assert.IsTrue(result.IsFinished);
      Assert.IsEmpty(result.Moves); // No moves should be available when on the exit
    }

  }
}
