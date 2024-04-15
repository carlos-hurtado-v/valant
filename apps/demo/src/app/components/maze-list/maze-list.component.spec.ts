import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MazeListComponent } from './maze-list.component';

describe('MazeListComponent', () => {
  let component: MazeListComponent;
  let fixture: ComponentFixture<MazeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MazeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MazeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
