import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameModeSelectComponent } from './game-mode-select.component';

describe('GameModeSelectComponent', () => {
  let component: GameModeSelectComponent;
  let fixture: ComponentFixture<GameModeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameModeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameModeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
