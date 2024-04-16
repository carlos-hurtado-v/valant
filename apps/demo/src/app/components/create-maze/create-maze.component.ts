import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MazeService } from '../../services/maze.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'valant-create-maze',
  templateUrl: './create-maze.component.html',
  styleUrls: ['./create-maze.component.less']
})
export class CreateMazeComponent  {

  mazeName: string = '';
  file: File | null = null;
  errorMessage: string = '';
  isBusy = false;

  constructor(
    public dialogRef: MatDialogRef<CreateMazeComponent>,
    private mazeService: MazeService,
    private snackbar: MatSnackBar
  ) { }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: any): void {
    const selectedFile = event.target.files[0];
    if (selectedFile?.name.endsWith('.mze')) {
      this.file = selectedFile;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Invalid file type. Please select a .mze file.';
      this.file = null;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.file && this.mazeName) {
      this.isBusy = true;
      this.mazeService.createMaze(this.mazeName, this.file).subscribe({
        next: () => {
          this.dialogRef.close('created');
          this.snackbar.open('Maze created successfully', 'OK!', {
            duration: 3000
          })
        },
        error: (error) => {
          this.errorMessage = `Failed to create maze: ${error}`;
        },
        complete: () => {
          this.isBusy = false;
        }
      });
    }
  }  

}
