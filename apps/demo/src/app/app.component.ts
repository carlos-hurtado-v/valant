import { Component} from '@angular/core';
import { Maze } from './models/maze.model';

@Component({
  selector: 'valant-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent{

  selectedMaze: Maze | null = null;

  constructor() {}

  onMazeSelected(maze: Maze): void {
    this.selectedMaze = maze;
  }

}
