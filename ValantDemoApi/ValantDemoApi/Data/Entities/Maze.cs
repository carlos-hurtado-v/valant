using System.ComponentModel.DataAnnotations;
using System;

namespace ValantDemoApi.Data.Entities
{
  public class Maze
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Definition { get; set; }
  }
}
