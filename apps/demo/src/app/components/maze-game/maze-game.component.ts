import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Maze } from '../../models/maze.model';
import { Subscription, interval } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private snackbar: MatSnackBar) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.maze?.currentValue) {
      this.resetGame();
    }
  }

  setupMaze(): void {
    if (this.maze?.definition) {
      this.mazeLayout = this.maze.definition
        .split('\n') // Split into rows by newline
        .map((row) => this.cleanRow(row.split(''))); // Clean each row

      this.findStartPosition();

      if (this.playerPosition) {
        this.mazeLayout[this.playerPosition.x][this.playerPosition.y] = 'P';
      }
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
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.gameOn = false;
    this.timerDisplay = '00:00';
    this.timeElapsed = 0;
    this.previousCell = 'S';

    if (this.maze?.definition) {
      this.setupMaze();
    }    
  }

  startGame(): void {
    this.resetGame();
    this.gameOn = true;
    this.timerSubscription = interval(1000).subscribe((_) => {
      if (this.gameOn) {
        this.timeElapsed++;
        this.timerDisplay = this.formatTime(this.timeElapsed);
      }
    });
  }

  formatTime(totalSeconds: number): string {
    const minutes: number = Math.floor(totalSeconds / 60);
    const seconds: number = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  move(direction: string): void {
    if (!this.mazeLayout || !this.playerPosition || !this.gameOn) return;

    let newX = this.playerPosition.x;
    let newY = this.playerPosition.y;

    switch (direction) {
      case 'up':
        newX--;
        break;
      case 'down':
        newX++;
        break;
      case 'left':
        newY--;
        break;
      case 'right':
        newY++;
        break;
    }

    // Check for boundaries and walls
    if (
      newX < 0 ||
      newX >= this.mazeLayout.length ||
      newY < 0 ||
      newY >= this.mazeLayout[newX].length ||
      this.mazeLayout[newX][newY] === 'X'
    ) {
      console.log('Move blocked by a wall or boundary');
      return;
    }

    // Update the maze layout to remove the player from the old position
    this.mazeLayout[this.playerPosition.x][this.playerPosition.y] = this.previousCell; // Store the cell under the player before moving

    // Save the previous cell type before moving the player
    this.previousCell = this.mazeLayout[newX][newY];
    this.mazeLayout[newX][newY] = 'P'; // Mark the new player position with 'P'

    // Update the player's position
    this.playerPosition.x = newX;
    this.playerPosition.y = newY;

    this.mazeLayout = [...this.mazeLayout];

    // Check if reached the end
    if (this.previousCell === 'E') {
      this.snackbar.open('Congratulations! You have reached the exit.', 'YAY!', {
        duration: 3000
      })
      this.gameOn = false;
    }
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

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
