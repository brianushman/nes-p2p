import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsCanvasComponent } from './ws-canvas.component';

describe('WsCanvasComponent', () => {
  let component: WsCanvasComponent;
  let fixture: ComponentFixture<WsCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
