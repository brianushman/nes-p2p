import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlMappingsComponent } from './control-mappings.component';

describe('ControlMappingsComponent', () => {
  let component: ControlMappingsComponent;
  let fixture: ComponentFixture<ControlMappingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlMappingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlMappingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
