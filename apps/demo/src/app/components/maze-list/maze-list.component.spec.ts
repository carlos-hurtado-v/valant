import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MazeListComponent } from './maze-list.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MazeService } from '../../services/maze.service';
import { Maze } from '../../models/maze.model';

describe('MazeListComponent', () => {
  let component: MazeListComponent;
  let fixture: ComponentFixture<MazeListComponent>;
  let mockMazeService: jest.Mocked<MazeService>;
  let mockDialog: MatDialogRef<any>;

  beforeEach(async () => {
    mockMazeService = {
      getMazes: jest.fn()
    } as any;
    mockDialog = { open: jest.fn(), afterClosed: jest.fn(() => of('created')) } as any;

    await TestBed.configureTestingModule({
      declarations: [ MazeListComponent ],
      imports: [MatDialogModule],
      providers: [
        { provide: MazeService, useValue: mockMazeService },
        { provide: MatDialogRef, useValue: mockDialog }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MazeListComponent);
    component = fixture.componentInstance;
    mockMazeService.getMazes.mockReturnValue(of([{ id: 1, name: 'Test Maze', definition: 'SOOO\nOOOO\nOOEO\nOOOO' }]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load mazes on init', () => {
    expect(mockMazeService.getMazes).toHaveBeenCalled();
    expect(component.isLoading).toBeFalsy();
  });

  it('should handle errors when loading mazes fails', () => {
    mockMazeService.getMazes.mockReturnValue(throwError(new Error('Failed to load mazes')));
    const spy = jest.spyOn(console, 'error');

    component.loadMazes();
  
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('Failed to load mazes:', expect.any(Error));
  
    expect(component.isLoading).toBeFalsy();
  });


  it('should open the create maze dialog and reload mazes on close if created', () => {
    const spy = jest.spyOn(component, 'loadMazes');
    component.openCreateMazeModal();
    // Simulate dialog closure with 'created' result
    mockDialog.afterClosed().subscribe(result => {
      if (result === 'created') {
        expect(spy).toHaveBeenCalled();
      }
    });
  });

  it('should emit selectMaze event when maze is selected', () => {
    const maze: Maze = { id: 1, name: 'Test Maze', definition: 'SOOO' };
    jest.spyOn(component.selectMaze, 'emit');
    component.openMaze(maze);
    expect(component.selectMaze.emit).toHaveBeenCalledWith(maze);
  });

  afterEach(() => {
    fixture.destroy();
    jest.clearAllMocks();
  });
});