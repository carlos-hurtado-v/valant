using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ValantDemoApi.Contracts;
using ValantDemoApi.Data.Entities;
using ValantDemoApi.Models;

namespace ValantDemoApi.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class MazeController : ControllerBase
  {
    private readonly ILogger<MazeController> _logger;
    private readonly IMazeService _mazeService;

    public MazeController(ILogger<MazeController> logger, IMazeService mazeService)
    {
      _logger = logger;
      _mazeService = mazeService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(Maze), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateMaze([FromForm] string name, [FromForm] IFormFile file)
    {
      if (file == null || file.Length == 0) return BadRequest("File is not uploaded");

      if (string.IsNullOrWhiteSpace(name)) return BadRequest("Maze name is required");

      string rawMazeContent;
      string[] mazeDefinition;
      using (var reader = new StreamReader(file.OpenReadStream()))
      {
        rawMazeContent = await reader.ReadToEndAsync();
        mazeDefinition = rawMazeContent.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
      }

      var validationResult = await _mazeService.ValidateMaze(name, mazeDefinition);
      if (!validationResult.Success)
      {
        return BadRequest(validationResult.Message);
      }

      var created = await _mazeService.CreateMazeAsync(name, rawMazeContent);

      return Ok(created);
    }

    [HttpPost]
    [Route("moves")]
    [ProducesResponseType(typeof(MazeMoveResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> GetAvailableMoves([FromBody] PlayerState state)
    {
      if (state == null)
        return BadRequest("Player state is required");

      var moves = await _mazeService.GetAvailableMovesAsync(state);
      if (moves == null)
        return BadRequest("Maze not found");

      return Ok(moves);
    }

    [HttpGet]
    [Route("all")]
    [ProducesResponseType(typeof(IEnumerable<Maze>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMazes()
    {
      return Ok(await _mazeService.GetMazesAsync());
    }

  }
}
