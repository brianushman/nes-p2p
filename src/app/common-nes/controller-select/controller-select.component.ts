import { Component, OnInit, HostListener  } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Controller } from "jsnes";
import { NesModal } from '../../app.modal';

import { GamepadService, InputDevice, InputMapping } from '../../services/gamepad.service';

@Component({
  selector: 'controller-select',
  templateUrl: './controller-select.component.html',
  styleUrls: ['./controller-select.component.css']
})
export class ControllerSelectComponent implements OnInit {

  keyMappings = {
    "D-PAD UP": Controller.BUTTON_UP,
    "D-PAD DOWN": Controller.BUTTON_DOWN,
    "D-PAD LEFT": Controller.BUTTON_LEFT,
    "D-PAD RIGHT": Controller.BUTTON_RIGHT,
    "BUTTON A": Controller.BUTTON_A,
    "BUTTON B": Controller.BUTTON_B,
    "SELECT": Controller.BUTTON_SELECT,
    "START": Controller.BUTTON_START
  };

  devices: InputDevice[];
  isActive: boolean = false;
  public cookiesEnabled: boolean = false;
  public currentBtn: number = -1;
  public mapping: any = {};
  public inputMapping: InputMapping;

  constructor(
    private gamepadService: GamepadService,
    private cookieService: CookieService
  ) {
    this.inputMapping = new InputMapping(this.cookieService);
  }

  ngOnInit() {
    var cookieValue = "a@92sk12";
    this.cookieService.set("nesp2p-test", cookieValue);
    this.cookiesEnabled = (this.cookieService.get("nesp2p-test") == cookieValue);
    this.gamepadService.connect();
    this.devices = this.gamepadService.availableDevices();
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(!this.isActive || this.currentBtn < 0) return;
    var keyPressedText = event.key.toUpperCase();
    var keyCode = event.keyCode;
    this.mapping[this.keyMappingValues()[this.currentBtn]] = keyCode;
    this.next();
  }

  addGamepad() {
    new NesModal().discover_gamepads(this.gamepadService, () => {
      this.devices = this.gamepadService.availableDevices();
    });
  }

  setup() {
    this.isActive = true;
    this.currentBtn = 0;
    this.mapping = {};
  }

  next() {
    this.currentBtn += 1;
    if(this.currentBtn > 7) {
      this.currentBtn = -1;
    }
  }

  save() {
    this.cookieService.set("nesp2p-controller-mapping", JSON.stringify(this.invertMap(this.mapping)), new Date(new Date().getFullYear() + 20, 1, 1));
    this.gamepadService.loadInputMapping();
    this.isActive = false;
  }

  close() {
    this.isActive = false;
  }

  keyValueString(key) {
    var value = this.mapping[key];
    if(this.keyValueIndex(key) == this.currentBtn) return "PRESS ANYTHING";
    if(value == undefined) return "-NOT DEFINED-";
    return this.inputMapping.keyboardSpecialKeyCodeMap[value].toUpperCase();
  }

  keyName(key) {
    return Object.keys(this.keyMappings)[this.keyValueIndex(key)];
  }

  keyValueIndex(key) {
    return Object.values(this.keyMappings).indexOf(key);
  }

  keyMappingValues() {
    return Object.values(this.keyMappings);
  }

  keyIcon(key) {
    switch(key) {
      case Controller.BUTTON_UP:
        return "assets/images/controller-select/dpad-up.png";
      case Controller.BUTTON_DOWN:
        return "assets/images/controller-select/dpad-down.png";
      case Controller.BUTTON_LEFT:
        return "assets/images/controller-select/dpad-left.png";
      case Controller.BUTTON_RIGHT:
        return "assets/images/controller-select/dpad-right.png";
      case Controller.BUTTON_A:
        return "assets/images/controller-select/a-btn.png";
      case Controller.BUTTON_B:
        return "assets/images/controller-select/b-btn.png";
      case Controller.BUTTON_SELECT:
        return "assets/images/controller-select/select-btn.png";
      case Controller.BUTTON_START:
        return "assets/images/controller-select/start-btn.png";
    }
  }

  keyIconAlt(key) {
    switch(key) {
      case Controller.BUTTON_UP:
        return "assets/images/controller-select/dpad-up-alt.png";
      case Controller.BUTTON_DOWN:
        return "assets/images/controller-select/dpad-down-alt.png";
      case Controller.BUTTON_LEFT:
        return "assets/images/controller-select/dpad-left-alt.png";
      case Controller.BUTTON_RIGHT:
        return "assets/images/controller-select/dpad-right-alt.png";
      case Controller.BUTTON_A:
        return "assets/images/controller-select/a-btn-alt.png";
      case Controller.BUTTON_B:
        return "assets/images/controller-select/b-btn-alt.png";
      case Controller.BUTTON_SELECT:
        return "assets/images/controller-select/select-btn-alt.png";
      case Controller.BUTTON_START:
        return "assets/images/controller-select/start-btn-alt.png";
    }
  }

  GamepadService() {
    return this.gamepadService;
  }

  private invertMap(map) {
    var tempMap = {};
    for(let item of Object.keys(map)) {
      tempMap[map[item]] = item;
    }
    return tempMap;
  }
}
