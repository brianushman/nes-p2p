import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControllerSelectComponent } from './controller-select.component';

describe('ControllerSelectComponent', () => {
  let component: ControllerSelectComponent;
  let fixture: ComponentFixture<ControllerSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControllerSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControllerSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
