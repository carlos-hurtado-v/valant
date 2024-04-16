import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateMazeComponent } from './create-maze.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MazeService } from '../../services/maze.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

describe('CreateMazeComponent', () => {
  let component: CreateMazeComponent;
  let fixture: ComponentFixture<CreateMazeComponent>;
  let mazeService: MazeService;
  let dialogRef: MatDialogRef<CreateMazeComponent>;
  let snackbar: MatSnackBar;

  beforeEach(async () => {
    const dialogRefMock = {
      close: jasmine.createSpy('close')
    };

    const snackbarMock = {
      open: jasmine.createSpy('open')
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BrowserAnimationsModule, MatInputModule, MatFormFieldModule, FormsModule],
      declarations: [ CreateMazeComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MatSnackBar, useValue: snackbarMock },
        MazeService 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMazeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    mazeService = TestBed.inject(MazeService);
    dialogRef = TestBed.inject(MatDialogRef);
    snackbar = TestBed.inject(MatSnackBar);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set file to null with an error message if incorrect file type selected', () => {
    component.onFileSelected({ target: { files: [ { name: 'wrong_file.txt' } ] } });
    expect(component.file).toBeNull();
    expect(component.errorMessage).toBe('Invalid file type. Please select a .mze file.');
  });

  it('should handle file selection correctly if .mze file is selected', () => {
    component.onFileSelected({ target: { files: [ { name: 'valid_file.mze' } ] } });
    expect(component.file).toBeDefined();
    expect(component.errorMessage).toBe('');
  });

  it('should close the dialog and show success message when maze is created successfully', () => {
    spyOn(mazeService, 'createMaze').and.returnValue(of({}));
    component.mazeName = 'My Maze';
    component.file = new File([], 'valid_file.mze');

    component.onSubmit();

    expect(mazeService.createMaze).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith('created');
    expect(snackbar.open).toHaveBeenCalledWith('Maze created successfully', 'OK!', { duration: 3000 });
  });

  it('should display an error message when maze creation fails', () => {
    spyOn(mazeService, 'createMaze').and.returnValue(throwError(() => new Error('Failed to create maze')));
    component.mazeName = 'My Maze';
    component.file = new File([], 'valid_file.mze');

    component.onSubmit();

    expect(component.errorMessage).toContain('Failed to create maze');
  });

});