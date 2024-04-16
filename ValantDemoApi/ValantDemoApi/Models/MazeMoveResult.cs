using System.Collections.Generic;

namespace ValantDemoApi.Models
{
  public class MazeMoveResult
  {
    // To indicate if the maze has been solved
    public bool IsFinished { get; set; }

    // Next available moves
    public List<string> Moves { get; set; } = new();
  }
}
