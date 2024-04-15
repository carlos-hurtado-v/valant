import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MazeGameComponent } from './maze-game.component';

describe('MazeGameComponent', () => {
  let component: MazeGameComponent;
  let fixture: ComponentFixture<MazeGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MazeGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MazeGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
