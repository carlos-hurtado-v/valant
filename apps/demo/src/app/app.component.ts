import { Component, OnInit } from '@angular/core';
import { LoggingService } from './logging/logging.service';
import { Maze } from './models/maze.model';

@Component({
  selector: 'valant-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {

  selectedMaze: Maze | null = null;

  constructor(private logger: LoggingService) {}

  ngOnInit() {
    this.logger.log('Welcome to the AppComponent');
  }

  onMazeSelected(maze: Maze): void {
    this.selectedMaze = maze;
  }

}
