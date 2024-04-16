import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Maze } from '../../models/maze.model';
import { Subscription, interval } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MazeService } from '../../services/maze.service';

@Component({
  selector: 'valant-maze-game',
  templateUrl: './maze-game.component.html',
  styleUrls: ['./maze-game.component.less'],
})
export class MazeGameComponent implements OnChanges {

  @Input() maze: Maze | null = null;
  mazeLayout: string[][];
  playerPosition: { x: number; y: number };
  previousCell: string = 'S';
  timerDisplay: string = '00:00';
  gameOn = false;
  timeElapsed: number = 0;
  timerSubscription: Subscription;
  availableMoves: string[] = [];
  isBusy = false;

  constructor(private snackbar: MatSnackBar, private mazeService: MazeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.maze?.currentValue) {
      this.resetGame();
    }
  }

  setupMaze(): void {
    if (this.maze?.definition) {
      console.log('Setting up maze');
      this.mazeLayout = this.maze.definition
        .split('\n') // Split into rows by newline
        .map((row) => this.cleanRow(row.split(''))); // Clean each row

      // Find the player's starting position and update the maze layout
      this.findStartPosition();

      if (this.playerPosition) {
        this.mazeLayout[this.playerPosition.x][this.playerPosition.y] = 'P';
      }
    }
  }

  fetchAvailableMoves(): void {
    if (this.maze && this.playerPosition) {
      this.isBusy = true;
      this.mazeService.getAvailableMoves(this.maze.id, this.playerPosition.x, this.playerPosition.y).subscribe({
        next: (result) => {
          this.availableMoves = result.moves;
          if (result.isFinished) {
            this.gameOn = false;
            this.snackbar.open('Congratulations! You have reached the exit.', 'YAY!', {
              duration: 3000
            });
          }
        },
        error: () => this.snackbar.open('Failed to fetch moves. Please retry.', 'Oops', {
          duration: 3000
        }),
        complete: () => this.isBusy = false
      });
    }
  }  

  cleanRow(row: string[]): string[] {
    return row.filter((char) => 'SOEX'.includes(char));
  }

  findStartPosition(): void {
    for (let i = 0; i < this.mazeLayout.length; i++) {
      for (let j = 0; j < this.mazeLayout[i].length; j++) {
        if (this.mazeLayout[i][j] === 'S') {
          this.playerPosition = { x: i, y: j };
          return;
        }
      }
    }
  }

  resetGame(): void {
    if (this.timerSubscription)
      this.timerSubscription.unsubscribe();
    this.timerSubscription = new Subscription();
    this.gameOn = false;
    this.timerDisplay = '00:00';
    this.timeElapsed = 0;
    this.previousCell = 'S';
    this.setupMaze();
  }

  startGame(): void {
    this.resetGame();
    this.gameOn = true;
    this.timerSubscription.add(
      interval(1000).subscribe(() => {
        if (this.gameOn) {
          this.timeElapsed++;
          this.timerDisplay = this.formatTime(this.timeElapsed);
        }
      })
    );
    this.fetchAvailableMoves();
  }

  formatTime(totalSeconds: number): string {
    const minutes: number = Math.floor(totalSeconds / 60);
    const seconds: number = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  move(direction: string): void {
    if (!this.availableMoves.includes(direction))
      return;

    let newX = this.playerPosition.x;
    let newY = this.playerPosition.y;

    switch (direction) {
      case 'up': newX--; break;
      case 'down': newX++; break;
      case 'left': newY--; break;
      case 'right': newY++; break;
    }

    // Update the player position
    this.previousCell = this.mazeLayout[newX][newY];
    this.mazeLayout[this.playerPosition.x][this.playerPosition.y] = 'O';
    this.mazeLayout[newX][newY] = 'P';
    this.playerPosition = { x: newX, y: newY };

    // Continue to fetch new moves from the server
    this.fetchAvailableMoves();
  }

  getCellClass(cell: string, i: number, j: number): string {
    // Calculate the distance from the player
    const distance = Math.sqrt(Math.pow(i - this.playerPosition.x, 2) + Math.pow(j - this.playerPosition.y, 2));
  
    // Player can see up to 1 cell around them
    if (distance > 1) {
      return 'hidden';
    }
  
    // Return class based on cell type
    switch (cell) {
      case 'P': return 'player';   // Player's current position
      case 'S': return 'start';    // Start position
      case 'E': return 'exit';     // Exit position
      case 'X': return 'wall';     // Walls of the maze
      default:  return 'open';     // Open paths
    }
  }

  isMoveAvailable(direction: string): boolean {
    return !this.isBusy && this.gameOn && this.availableMoves?.includes(direction);
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
