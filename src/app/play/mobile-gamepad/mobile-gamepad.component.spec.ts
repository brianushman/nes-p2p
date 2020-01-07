import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileGamepadComponent } from './mobile-gamepad.component';

describe('MobileGamepadComponent', () => {
  let component: MobileGamepadComponent;
  let fixture: ComponentFixture<MobileGamepadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileGamepadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileGamepadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
