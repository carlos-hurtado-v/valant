using System.Collections.Generic;
using System.Threading.Tasks;
using ValantDemoApi.Data.Entities;
using ValantDemoApi.Models;

namespace ValantDemoApi.Contracts
{
  public interface IMazeService
  {
    Task<Maze> GetMazeAsync(string name);
    Task<IEnumerable<Maze>> GetMazesAsync();
    Task<Maze> CreateMazeAsync(string name, string definition);
    Task<MazeValidationResult> ValidateMaze(string name, string[] definition);
  }
}
