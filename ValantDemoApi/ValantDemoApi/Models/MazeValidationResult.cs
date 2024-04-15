namespace ValantDemoApi.Models
{
  public class MazeValidationResult
  {
    public MazeValidationResult(bool success, string message)
    {
      Success = success;
      Message = message;
    }

    public MazeValidationResult(bool success) { Success = success; }

    public bool Success { get; set; }
    public string Message { get; set; }
  }
}
