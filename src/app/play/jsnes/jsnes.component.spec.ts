import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JsnesComponent } from './jsnes.component';

describe('JsnesComponent', () => {
  let component: JsnesComponent;
  let fixture: ComponentFixture<JsnesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JsnesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsnesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
