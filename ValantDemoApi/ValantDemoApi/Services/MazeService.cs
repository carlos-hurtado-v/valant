using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ValantDemoApi.Contracts;
using ValantDemoApi.Data;
using ValantDemoApi.Data.Entities;
using ValantDemoApi.Models;

namespace ValantDemoApi.Services
{
  public class MazeService : IMazeService
  {
    protected MazeDbContext Context;

    public MazeService(MazeDbContext context)
    {
      Context = context;
    }

    public async Task<Maze> GetMazeAsync(string name)
    {
      return await Context.Mazes.FirstOrDefaultAsync(x => x.Name == name);
    }

    public async Task<IEnumerable<Maze>> GetMazesAsync()
    {
      return await Context.Mazes.ToListAsync();
    }

    public async Task<Maze> CreateMazeAsync(string name, string definition)
    {
      var maze = new Maze
      {
        Name = name,
        Definition = definition
      };

      Context.Mazes.Add(maze);
      await Context.SaveChangesAsync();

      return maze;
    }

    public async Task<MazeValidationResult> ValidateMaze(string name, string[] definition)
    {
      // Check if a maze with the same name already exists
      var existing = await Context.Mazes.AnyAsync(x => x.Name == name);
      if (existing)
        return new MazeValidationResult(false, "Maze with the same name already exists.");


      // Validate the maze definition
      var rawDefinition = definition.SelectMany(x => x.ToUpper()).ToList();

      var entries = rawDefinition.Count(x => x == 'E');
      if (entries != 1)
        return new MazeValidationResult(false, "Maze must have exactly one entry point.");

      var exits = rawDefinition.Count(x => x == 'S');
      if (exits != 1)
        return new MazeValidationResult(false, "Maze must have exactly one exit point.");

      var paths = rawDefinition.Count(x => x == 'O');
      if (paths == 0)
        return new MazeValidationResult(false, "Maze must have at least one path.");

      var isSolvable = IsSolvable(definition);
      return !isSolvable ? new MazeValidationResult(false, "Maze is not solvable.") : new MazeValidationResult(true);
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