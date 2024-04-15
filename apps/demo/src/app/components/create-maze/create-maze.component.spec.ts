import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMazeComponent } from './create-maze.component';

describe('CreateMazeComponent', () => {
  let component: CreateMazeComponent;
  let fixture: ComponentFixture<CreateMazeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMazeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMazeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
