import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Maze } from '../models/maze.model';
import { MazeMoveResult } from '../models/move-result.model';


@Injectable({
  providedIn: 'root',
})
export class MazeService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  createMaze(name: string, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  getMazes(): Observable<Maze[]> {
    return this.http.get<Maze[]>(`${this.baseUrl}/all`).pipe(
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  getAvailableMoves(mazeId: number, x: number, y: number): Observable<MazeMoveResult> {
    return this.http.post<MazeMoveResult>(`${this.baseUrl}/moves`, { mazeId, x, y })
      .pipe(catchError(this.handleError));
  }  

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error);
  }
}