using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ValantDemoApi.Contracts;
using ValantDemoApi.Data;
using ValantDemoApi.Data.Entities;
using ValantDemoApi.Models;

namespace ValantDemoApi.Services
{
  public class MazeService : IMazeService
  {
    
    private readonly MazeDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromHours(1); // Could be configurable

    public MazeService(MazeDbContext context, IMemoryCache cache)
    {
      _context = context;
      _cache = cache;
    }

    public async Task<Maze> GetMazeAsync(int id)
    {
      // Check if the maze is in the cache
      if (_cache.TryGetValue(id, out Maze cachedMaze))
        return cachedMaze;

      cachedMaze = await _context.Mazes.FindAsync(id);
      if (cachedMaze != null)
        _cache.Set(id, cachedMaze, _cacheDuration);

      return cachedMaze;
    }

    public async Task<IEnumerable<Maze>> GetMazesAsync()
    {
      return await _context.Mazes.ToListAsync();
    }

    public async Task<Maze> CreateMazeAsync(string name, string definition)
    {
      var maze = new Maze
      {
        Name = name,
        Definition = definition
      };

      _context.Mazes.Add(maze);
      await _context.SaveChangesAsync();

      return maze;
    }

    public async Task<MazeValidationResult> ValidateMaze(string name, string[] definition)
    {
      // Check if a maze with the same name already exists
      var existing = await _context.Mazes.AnyAsync(x => x.Name == name);
      if (existing)
        return new MazeValidationResult(false, "Maze with the same name already exists.");


      // Validate the maze definition
      var rawDefinition = definition.SelectMany(x => x.ToUpper()).ToList();

      var entries = rawDefinition.Count(x => x == 'S');
      if (entries != 1)
        return new MazeValidationResult(false, "Maze must have exactly one entry point.");

      var exits = rawDefinition.Count(x => x == 'E');
      if (exits != 1)
        return new MazeValidationResult(false, "Maze must have exactly one exit point.");

      var paths = rawDefinition.Count(x => x == 'O');
      if (paths == 0)
        return new MazeValidationResult(false, "Maze must have at least one path.");

      var isSolvable = IsSolvable(definition);
      return !isSolvable ? new MazeValidationResult(false, "Maze is not solvable.") : new MazeValidationResult(true);
    }

    public async Task<MazeMoveResult> GetAvailableMovesAsync(PlayerState state)
    {
      var result = new MazeMoveResult();
      var maze = await GetMazeAsync(state.MazeId);
      if (maze == null) return null;

      var rows = maze.Definition.Split('\n');

      // Check if the player has reached the exit
      if (rows[state.X][state.Y] == 'E')
      {
        result.IsFinished = true;
        return result;
      }

      // Ensure position is within bounds and check in all directions for available moves
      if (state.X > 0 && rows[state.X - 1][state.Y] != 'X')
        result.Moves.Add("up");
      if (state.X < rows.Length - 1 && rows[state.X + 1][state.Y] != 'X')
        result.Moves.Add("down");
      if (state.Y > 0 && rows[state.X][state.Y - 1] != 'X')
        result.Moves.Add("left");
      if (state.Y < rows[state.X].Length - 1 && rows[state.X][state.Y + 1] != 'X')
        result.Moves.Add("right");

      return result;
    }

    private static bool IsSolvable(string[] maze)
    {
      if (maze == null || maze.Length == 0) return false;

      var expectedLength = maze[0].Length; // Assume the first row's length is the standard
      var rows = maze.Length;
      var visited = new bool[rows, expectedLength];
      var foundStart = false;
      (int x, int y) start = (-1, -1);

      // Validate and initialize visited array, find the start position
      for (var i = 0; i < rows; i++)
      {
        if (maze[i].Length != expectedLength)
          // Pad the row with walls to make it the same length as the expected length
          maze[i] = maze[i].PadRight(expectedLength, 'X');

        for (var j = 0; j < expectedLength; j++)
        {
          visited[i, j] = maze[i][j] == 'X'; // Mark walls as visited

          if (foundStart || maze[i][j] != 'S')
            continue;

          start = (i, j);
          foundStart = true;
        }
      }

      // No start position found
      if (start == (-1, -1))
        return false;

      return Dfs(start.x, start.y); // Start DFS from the start position

      // DFS to explore the maze
      bool Dfs(int x, int y)
      {
        if (x < 0 || y < 0 || x >= rows || y >= expectedLength || visited[x, y])
          return false;

        if (maze[x][y] == 'E')
          return true; // Found the exit

        visited[x, y] = true; // Mark this cell as visited

        // Explore neighbors
        return Dfs(x, y + 1) || Dfs(x + 1, y) || Dfs(x, y - 1) || Dfs(x - 1, y);
      }
    }
  }
}
