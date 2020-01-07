import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineLobbyComponent } from './offline-lobby.component';

describe('OfflineLobbyComponent', () => {
  let component: OfflineLobbyComponent;
  let fixture: ComponentFixture<OfflineLobbyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineLobbyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
