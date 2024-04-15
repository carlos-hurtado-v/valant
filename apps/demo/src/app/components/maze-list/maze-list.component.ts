import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MazeService } from '../../services/maze.service';
import { Maze } from '../../models/maze.model';
import { CreateMazeComponent } from '../create-maze/create-maze.component';

@Component({
  selector: 'valant-maze-list',
  templateUrl: './maze-list.component.html',
  styleUrls: ['./maze-list.component.less']
})
export class MazeListComponent implements OnInit {
  @Output() selectMaze = new EventEmitter<Maze>();
  mazes$: Observable<Maze[]>;
  isLoading = false;

  constructor(private mazeService: MazeService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMazes();
  }

  loadMazes(): void {
    this.isLoading = true;
    this.mazes$ = this.mazeService.getMazes();
    this.mazes$.subscribe(
      () => {
        this.isLoading = false;
      },
      error => {
        console.error('Failed to load mazes:', error);
        this.isLoading = false;
      }
    );
  }

  openCreateMazeModal(): void {
    const dialogRef = this.dialog.open(CreateMazeComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'created') {
        this.loadMazes();
      }
    });
  }

  openMaze(maze): void {
    this.selectMaze.emit(maze);
  }
}