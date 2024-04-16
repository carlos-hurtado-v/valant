import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MazeGameComponent } from './maze-game.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MazeService } from '../../services/maze.service';
import { of } from 'rxjs';

describe('MazeGameComponent', () => {
  let component: MazeGameComponent;
  let fixture: ComponentFixture<MazeGameComponent>;
  let mazeServiceMock: jest.Mocked<MazeService>;
  let snackBarMock: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    mazeServiceMock = {
      getAvailableMoves: jest.fn()
    } as any;
    snackBarMock = {
      open: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [ MazeGameComponent ],
      providers: [
        { provide: MazeService, useValue: mazeServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // This helps to ignore elements unknown in the template
    }).compileComponents();

    fixture = TestBed.createComponent(MazeGameComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should setup maze on input changes if maze is provided', () => {
    component.maze = { id: 1, definition: 'SOOO\nOOOO\nOOEO\nOOOO' };
    component.ngOnChanges({
      maze: {
        previousValue: null,
        currentValue: component.maze,
        firstChange: true,
        isFirstChange: () => true
      }
    });
    expect(component.mazeLayout.length).toBe(4);
    expect(component.playerPosition).toEqual({ x: 0, y: 0 });
  });

  it('should handle move correctly when moving down', () => {
    mazeServiceMock.getAvailableMoves.mockReturnValue(of({ moves: ['down'], isFinished: false }));
    component.maze = { id: 1, definition: 'SOOO\nOOOO\nOOEO\nOOOO' };
    component.ngOnChanges({
      maze: {
        previousValue: null,
        currentValue: component.maze,
        firstChange: true,
        isFirstChange: () => true
      }
    });
    component.startGame();
    component.move('down');
    expect(component.playerPosition).toEqual({ x: 1, y: 0 });
    expect(component.mazeLayout[1][0]).toEqual('P');
  });

  it('should open snackbar when game finishes', () => {
    component.maze = { id: 1, definition: 'SOOO\nOOOO\nOOEO\nOOOO' };
    component.playerPosition = { x: 2, y: 2 };
    mazeServiceMock.getAvailableMoves.mockReturnValue(of({ moves: [], isFinished: true }));
    component.fetchAvailableMoves();
    expect(snackBarMock.open).toHaveBeenCalledWith('Congratulations! You have reached the exit.', 'YAY!', { duration: 3000 });
  });

  afterEach(() => {
    fixture.destroy();
    jest.clearAllMocks();
  });
});