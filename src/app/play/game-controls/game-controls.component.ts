import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Controller } from "jsnes";
import { GamepadService } from '../../services/gamepad.service';

@Component({
  selector: 'game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.css']
})
export class GameControlsComponent implements OnInit {

  @Output() quit = new EventEmitter<void>();
  @Output() muted = new EventEmitter<boolean>();
  @Output() fullscreen = new EventEmitter<boolean>();
  public volume_on: boolean = true;
  public expanded: boolean = false;
  document: any = document;

  constructor(private gamepadService: GamepadService) { }

  ngOnInit() {
    document.addEventListener('webkitfullscreenchange', this.exitedFullscreen.bind(this));
    document.addEventListener('mozfullscreenchange', this.exitedFullscreen.bind(this), false);
  }

  exitedFullscreen() {
    if ((this.document.webkitFullscreenElement == null ||
      this.document.webkitFullscreenElement == undefined) && 
      (this.document.mozFullscreenElement == null || this.document.mozFullscreenElement == undefined)) {
      this.expanded = false;
      this.fullscreen.emit(this.expanded);
    }
  }

  buttonKeyName(key) {
    switch(+key) {
      case Controller.BUTTON_UP:
        return "D-PAD UP";
      case Controller.BUTTON_DOWN:
        return "D-PAD DOWN";
      case Controller.BUTTON_LEFT:
        return "D-PAD LEFT";
      case Controller.BUTTON_RIGHT:
        return "D-PAD RIGHT";
      case Controller.BUTTON_A:
        return "BUTTON A";
      case Controller.BUTTON_B:
        return "BUTTON B";
      case Controller.BUTTON_SELECT:
        return "SELECT";
      case Controller.BUTTON_START:
        return "START";
    }
  }

  buttonValue(key) {
    var map = this.gamepadService.inputMapping.keyboardMap;
    var index = Object.values(map).indexOf(key);
    if(index < 0) return "-NOT SET-";
    return this.gamepadService.inputMapping.keyboardSpecialKeyCodeMap[Object.keys(map)[index]].toUpperCase();
  }

  buttonList() {
    return Object.values(this.gamepadService.inputMapping.keyboardMap);
  }

}
