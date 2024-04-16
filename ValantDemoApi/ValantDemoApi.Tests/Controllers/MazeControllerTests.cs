using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ValantDemoApi.Contracts;
using ValantDemoApi.Controllers;
using ValantDemoApi.Data.Entities;
using ValantDemoApi.Models;

namespace ValantDemoApi.Tests.Controllers
{
  [TestFixture]
  public class MazeControllerTests
  {
    private MazeController _controller;
    private Mock<IMazeService> _mockMazeService;
    private Mock<ILogger<MazeController>> _mockLogger;

    [SetUp]
    public void Setup()
    {
      _mockLogger = new Mock<ILogger<MazeController>>();
      _mockMazeService = new Mock<IMazeService>();
      _controller = new MazeController(_mockLogger.Object, _mockMazeService.Object);
    }

    [Test]
    public async Task CreateMaze_ReturnsBadRequest_WhenFileIsEmpty()
    {
      var result = await _controller.CreateMaze("Maze1", null);
      Assert.IsInstanceOf<BadRequestObjectResult>(result);
    }

    [Test]
    public async Task CreateMaze_ReturnsBadRequest_WhenNameIsEmpty()
    {
      var fileMock = new Mock<IFormFile>();
      var content = "SOOO\nOOOO\nOOEO\nOOOO";
      var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
      fileMock.Setup(_ => _.OpenReadStream()).Returns(stream);
      fileMock.Setup(_ => _.Length).Returns(stream.Length);

      var result = await _controller.CreateMaze("", fileMock.Object);
      Assert.IsInstanceOf<BadRequestObjectResult>(result);
    }

    [Test]
    public async Task CreateMaze_CreatesMazeSuccessfully()
    {
      var fileMock = new Mock<IFormFile>();
      var content = "SOOO\nOOOO\nOOEO\nOOOO";
      var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
      fileMock.Setup(_ => _.OpenReadStream()).Returns(stream);
      fileMock.Setup(_ => _.Length).Returns(stream.Length);

      _mockMazeService.Setup(s => s.ValidateMaze(It.IsAny<string>(), It.IsAny<string[]>()))
                      .ReturnsAsync(new MazeValidationResult(true));
      _mockMazeService.Setup(s => s.CreateMazeAsync(It.IsAny<string>(), It.IsAny<string>()))
                      .ReturnsAsync(new Maze { Name = "Maze1", Definition = content });

      var result = await _controller.CreateMaze("Maze1", fileMock.Object) as OkObjectResult;

      Assert.IsNotNull(result);
      Assert.IsInstanceOf<Maze>(result.Value);
      var maze = result.Value as Maze;
      Assert.AreEqual("Maze1", maze.Name);
    }

    [Test]
    public async Task GetAvailableMoves_ReturnsBadRequest_WhenStateIsNull()
    {
      var result = await _controller.GetAvailableMoves(null);
      Assert.IsInstanceOf<BadRequestObjectResult>(result);
    }

    [Test]
    public async Task GetAvailableMoves_ReturnsMovesSuccessfully()
    {
      var playerState = new PlayerState { MazeId = 1, X = 0, Y = 1 };
      var mazeMoveResult = new MazeMoveResult { IsFinished = false, Moves = new List<string> { "up", "down" } };
      _mockMazeService.Setup(s => s.GetAvailableMovesAsync(It.IsAny<PlayerState>()))
                      .ReturnsAsync(mazeMoveResult);

      var result = await _controller.GetAvailableMoves(playerState) as OkObjectResult;

      Assert.IsNotNull(result);
      Assert.IsInstanceOf<MazeMoveResult>(result.Value);
      var moves = result.Value as MazeMoveResult;
      Assert.Contains("up", moves.Moves);
      Assert.Contains("down", moves.Moves);
    }

    [Test]
    public async Task GetMazes_ReturnsAllMazesSuccessfully()
    {
      var mazes = new List<Maze> { new () { Name = "Maze1" }, new() { Name = "Maze2" } };
      _mockMazeService.Setup(s => s.GetMazesAsync()).ReturnsAsync(mazes);

      var result = await _controller.GetMazes() as OkObjectResult;

      Assert.IsNotNull(result);
      Assert.IsInstanceOf<IEnumerable<Maze>>(result.Value);
      var returnedMazes = result.Value as IEnumerable<Maze>;
      Assert.AreEqual(2, returnedMazes.Count());
    }
  }
}
