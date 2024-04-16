import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('AppComponent', () => {

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
    
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedMaze when onMazeSelected is called', () => {
    const maze = { id: 1, name: 'Test Maze', definition: 'SOOO\nOOOO\nOOEO\nOOOO' };
    component.onMazeSelected(maze);
    expect(component.selectedMaze).toEqual(maze);
  });
});
