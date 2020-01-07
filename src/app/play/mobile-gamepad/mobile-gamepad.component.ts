import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { GamepadService, InputButton } from '../../services/gamepad.service';
import { Controller } from "jsnes";

enum Buttons {
  Up = 1,
  Down,
  Left,
  Right,
  LeftUp,
  RightUp,
  RightDown,
  LeftDown,
  A,
  B,
  Start,
  Select
}

@Component({
  selector: 'mobile-gamepad',
  templateUrl: './mobile-gamepad.component.html',
  styleUrls: ['./mobile-gamepad.component.css']
})
export class MobileGamepadComponent implements OnInit, OnDestroy {
  public buttonEnums = Buttons;
  private multiButtonMapping = {}
  private touches = {};
  private elementMapping = {
  };
  
  constructor(private gamepadService: GamepadService) {
  }

  ngOnInit() {
    this.multiButtonMapping[Buttons.Up] = [Buttons.Up];
    this.multiButtonMapping[Buttons.Down] = [Buttons.Down];
    this.multiButtonMapping[Buttons.Left] = [Buttons.Left];
    this.multiButtonMapping[Buttons.Right] = [Buttons.Right];
    this.multiButtonMapping[Buttons.LeftUp] = [Buttons.Up, Buttons.Left];
    this.multiButtonMapping[Buttons.RightUp] = [Buttons.Up, Buttons.Right];
    this.multiButtonMapping[Buttons.RightDown] = [Buttons.Down, Buttons.Right];
    this.multiButtonMapping[Buttons.LeftDown] = [Buttons.Down, Buttons.Left];

    window.addEventListener("resize", this.autoResize.bind(this));
  }

  ngAfterViewInit() {
    this.createElementMapping();
    this.autoResize();
    document.addEventListener("touchstart", this.touchstart.bind(this));
    document.addEventListener("touchend", this.touchend.bind(this));
    document.addEventListener("touchmove", this.touchmove.bind(this));
  }

  ngOnDestroy() {
    document.addEventListener("touchstart", this.touchstart.bind(this));
    document.addEventListener("touchend", this.touchend.bind(this));
    document.addEventListener("touchmove", this.touchmove.bind(this));
  }

  pressed(btn: Buttons) {
    return Object.values(this.touches).indexOf(btn) >= 0;
  }

  onPressed(btn: Buttons, pressed: boolean) {
    console.log(`btn: ${btn}, pressed: ${pressed}`);
    this.gamepadService.update(new InputButton({ button: this.gamepadConvertKey(btn), pressed: pressed, player: 1 }));
  }

  private createElementMapping() {
    this.elementMapping[Buttons.A] = $('.btn-a').get(0);
    this.elementMapping[Buttons.B] = $('.btn-b').get(0);
    this.elementMapping[Buttons.Start] = $('.btn-start').get(0);
    this.elementMapping[Buttons.Select] = $('.btn-select').get(0);
    this.elementMapping[Buttons.LeftUp] = $('.d-pad-top-left').get(0);
    this.elementMapping[Buttons.Up] = $('.d-pad-top').get(0);
    this.elementMapping[Buttons.RightUp] = $('.d-pad-top-right').get(0);
    this.elementMapping[Buttons.Right] = $('.d-pad-right').get(0);
    this.elementMapping[Buttons.RightDown] = $('.d-pad-bottom-right').get(0);
    this.elementMapping[Buttons.Down] = $('.d-pad-bottom').get(0);
    this.elementMapping[Buttons.LeftDown] = $('.d-pad-bottom-left').get(0);
    this.elementMapping[Buttons.Left] = $('.d-pad-left').get(0);
  }

  touchstart(e) {
    for (let touch of e.changedTouches) {
      let newTouch = this.getTouchedElement(touch.clientX, touch.clientY);
      if(newTouch == undefined || this.pressed(newTouch)) continue; // only allow a button to have 1 touch
      this.touches[touch.identifier] = newTouch;
      this.onPressed(newTouch, true);
    }
  }

  touchmove(e) {
    for (let touch of e.changedTouches) {
      //if(this.touches[touch.identifier] == undefined) continue;      
      var newTouch = this.getTouchedElement(touch.clientX, touch.clientY);
      if(newTouch < Buttons.A) {
        if(this.touches[touch.identifier] != newTouch) {
          this.onDpad(this.touches[touch.identifier], newTouch);
          this.touches[touch.identifier] = newTouch;
        }
      }
      else {
        if(this.touches[touch.identifier] == newTouch) continue;
        this.onPressed(this.touches[touch.identifier], false);
        delete this.touches[touch.identifier];
      }
    }
  }

  touchend(e) {
    for (let touch of e.changedTouches) {
      if(this.touches[touch.identifier] == undefined) continue;
      let newTouch = this.getTouchedElement(touch.clientX, touch.clientY);
      if(newTouch == undefined || this.touches[touch.identifier] == undefined) continue;
      delete this.touches[touch.identifier];
      this.onPressed(newTouch, false);
    }
  }

  private getTouchedElement(x, y): Buttons {
    var length = Object.keys(Buttons).length / 2;
    for(var i = 1; i <= length; ++i) {
      if(this.pointInElement(i as Buttons, x, y)) return i as Buttons;
    }
    return undefined;
  }

  private pointInElement(button, x, y) {
    var rect = this.elementMapping[button].getBoundingClientRect();
    return (x >= rect.left && x < rect.right &&
       y >= rect.top && y < rect.bottom);
  }

  private autoResize() {
    var windowHeight = $(window).height();
    if(windowHeight < 400) {
      $("mobile-gamepad").height(150);
    }

    $(".d-pad").each(function(){
      var element = $(this);
      var width = element.width();
      element.height(width);
    });

    $(".btn-a,.btn-b").each(function(){
      var element = $(this);
      var width = element.parent().width();
      element.height(width);
    });
    $(".btn-start,.btn-select").each(function(){
      var element = $(this);
      var width = element.parent().width() / 2;
      element.height(width);
    });
  }

  private onDpad(oldBtn:Buttons, newBtn:Buttons) {
    if(oldBtn == undefined && newBtn == undefined) return;
    if(oldBtn == undefined) {
      for(let btn of this.multiButtonMapping[newBtn]) this.onPressed(btn, true);
      return;      
    }
    else if(oldBtn == undefined) {
      for(let btn of this.multiButtonMapping[oldBtn]) this.onPressed(btn, true);  
      return;          
    }
    for(let btn of this.multiButtonMapping[oldBtn]) {
      if(this.multiButtonMapping[newBtn].indexOf(btn) < 0) this.onPressed(btn, false);
    }
    for(let btn of this.multiButtonMapping[newBtn]) {
      if(this.multiButtonMapping[oldBtn].indexOf(btn) < 0) this.onPressed(btn, true);
    }
  }

  private gamepadConvertKey(btn: Buttons): Controller {
    switch(btn) {
      case Buttons.Up:
        return Controller.BUTTON_UP;
      case Buttons.Down:
        return Controller.BUTTON_DOWN;
      case Buttons.Left:
        return Controller.BUTTON_LEFT;
      case Buttons.Right:
        return Controller.BUTTON_RIGHT;
      case Buttons.A:
        return Controller.BUTTON_A;
      case Buttons.B:
        return Controller.BUTTON_B;
      case Buttons.Select:
        return Controller.BUTTON_SELECT;
      case Buttons.Start:
        return Controller.BUTTON_START;
    }
    return undefined;
  }

}
