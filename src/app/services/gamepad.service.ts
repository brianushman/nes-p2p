import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

import { Controller } from "jsnes";

@Injectable()
export class GamepadService {
    private scanTimer: any;
    private gamepadHash: boolean[] = [];
    player1Device: InputDevice = this.availableDevices()[0];
    private player2Device: any = "Keyboard";
    inputMapping: InputMapping;
    
    private msgSource = new BehaviorSubject<InputButton>(null);
    changed = this.msgSource.asObservable();

    constructor(private cookieService: CookieService) {
        this.loadInputMapping();
    }

    loadInputMapping() {
        this.inputMapping = new InputMapping(this.cookieService);
    }
    
    update(button: InputButton) {
        this.msgSource.next(button);
    }

    gamepadSupported(): boolean {
        return "getGamepads" in navigator;
    }

    availableDevices(): InputDevice[] {
        var devices: InputDevice[] = [];
        if(!this.gamepadSupported()) return [new InputDevice({ id: 0, isGamepad: false, name: "Keyboard" })];
        var gamepads = navigator.getGamepads();
        for(var i = 0; i < gamepads.length; ++i) {
            if(gamepads[i] != null && this.isValidGamepad(gamepads[i])) {
                devices.push(new InputDevice({ id: devices.length, isGamepad: true, name: gamepads[i].id }));
            }
        }
        devices.push(new InputDevice({ id: devices.length, isGamepad: false, name: "Keyboard" }));
        return devices;
    }

    connect() {
        document.addEventListener("keydown",  this.keydown.bind(this));
        document.addEventListener("keyup", this.keyup.bind(this));

        for(let key of Object.keys(this.inputMapping.gamepadMap)) {
            this.gamepadHash.push(false);
        }

        this.scanTimer = interval(100);
        this.scanTimer.subscribe(x => { this.onGamepad() });
    }

    disconnect() {
        document.removeEventListener("keydown", this.keydown);
        document.removeEventListener("keyup", this.keyup);
    }

    setPlayerDevice(id: number) {
        var devices = this.availableDevices();
        if(id >= devices.length) throw new Error("Input device doesn't exist");

        this.player1Device = devices[id];
        return devices[id];
    }

    onGamepad() {
        if(!this.player1Device.isGamepad) return;

        var gp = this.getSystemDevice(this.player1Device);
        if(gp == null) return;
        
        var id = gp.id;

        var mapping = this.inputMapping.getMapping(this.player1Device);
        Object.keys(mapping).forEach((key, index) => {
            var btn = gp.buttons[key];
            if(btn.pressed != this.gamepadHash[index]) {
                this.gamepadHash[index] = btn.pressed;
                this.update(new InputButton({ button: mapping[key], pressed: btn.pressed, player: 1 }));
            }
        });
    }

    keydown(e) {
        if(this.player1Device.isGamepad) return;
        var code = this.inputMapping.getMapping(this.player1Device)[e.keyCode];
        if(code == undefined) return;
        this.update(new InputButton({ button: code, pressed: true, player: 1 }));
    }

    keyup(e) {
        if(this.player1Device.isGamepad) return;
        var code = this.inputMapping.getMapping(this.player1Device)[e.keyCode];
        if(code == undefined) return;
        this.update(new InputButton({ button: code, pressed: false, player: 1 }));
    }

    private isValidGamepad(gp: Gamepad):boolean {
        return gp.buttons.length >= 6;
    }

    private getSystemDevice(device: InputDevice) {
        var gamepads = navigator.getGamepads();
        for(var i = 0; i < gamepads.length; ++i) {
            if(gamepads[i].id == device.name) return gamepads[i];
        }     
        return null;   
    }
}

export class InputButton {
    button: any;
    pressed: boolean;
    player: number;

    public constructor(init?:Partial<InputButton>) {
        Object.assign(this, init);
    }
}

export class InputDevice {
    id: number;
    isGamepad: boolean;
    name: string;

    public constructor(init?:Partial<InputDevice>) {
        Object.assign(this, init);
    }
}

export class InputMapping {
    private mapping: any = {};
    public gamepadMap = {
        0: Controller.BUTTON_A,
        1: Controller.BUTTON_B,
        8: Controller.BUTTON_SELECT,
        9: Controller.BUTTON_START,
        12: Controller.BUTTON_UP,
        13: Controller.BUTTON_DOWN,
        14: Controller.BUTTON_LEFT,
        15: Controller.BUTTON_RIGHT
    };

    public keyboardMap = {
        88: Controller.BUTTON_A, // X
        89: Controller.BUTTON_B, // Y (Central European keyboard)
        90: Controller.BUTTON_B, // Z
        17: Controller.BUTTON_SELECT, // Right Ctrl
        13: Controller.BUTTON_START, // Enter
        38: Controller.BUTTON_UP, // Up
        40: Controller.BUTTON_DOWN, // Down
        37: Controller.BUTTON_LEFT, // Left
        39: Controller.BUTTON_RIGHT, // Right
        /*103: [2, Controller.BUTTON_A], // Num-7
        105: [2, Controller.BUTTON_B], // Num-9
        99: [2, Controller.BUTTON_SELECT], // Num-3
        97: [2, Controller.BUTTON_START], // Num-1
        104: [2, Controller.BUTTON_UP], // Num-8
        98: [2, Controller.BUTTON_DOWN], // Num-2
        100: [2, Controller.BUTTON_LEFT], // Num-4
        102: [2, Controller.BUTTON_RIGHT], // Num-6*/
    };

    public keyboardSpecialKeyCodeMap = {
        0 : "THAT KEY HAS NO KEYCODE",
        3 : "BREAK",
        8 : "BACKSPACE / DELETE",
        9 : "TAB",
        12 : "CLEAR",
        13 : "ENTER",
        16 : "SHIFT",
        17 : "CTRL",
        18 : "ALT",
        19 : "PAUSE/BREAK",
        20 : "CAPS LOCK",
        21 : "HANGUL",
        25 : "HANJA",
        27 : "ESCAPRE",
        28 : "CONVERSION",
        29 : "NON-CONVERSION",
        32 : "SPACEBAR",
        33 : "PAGE UP",
        34 : "PAGE DOWN",
        35 : "END",
        36 : "HOME",
        37 : "LEFT ARROW",
        38 : "UP ARROW",
        39 : "RIGHT ARROW",
        40 : "DOWN ARROW",
        41 : "SELECT",
        42 : "PRINT",
        43 : "EXECUTE",
        44 : "PRINT SCREEN",
        45 : "INSERT",
        46 : "DELETE",
        47 : "HELP",
        48 : "0",
        49 : "1",
        50 : "2",
        51 : "3",
        52 : "4",
        53 : "5",
        54 : "6",
        55 : "7",
        56 : "8",
        57 : "9",
        58 : ":",
        59 : "SEMICOLON (FIREFOX), EQUALS",
        60 : "<",
        61 : "EQUALS (FIREFOX)",
        63 : "ß",
        64 : "@ (FIREFOX)",
        65 : "a",
        66 : "b",
        67 : "c",
        68 : "d",
        69 : "e",
        70 : "f",
        71 : "g",
        72 : "h",
        73 : "i",
        74 : "j",
        75 : "k",
        76 : "l",
        77 : "m",
        78 : "n",
        79 : "o",
        80 : "p",
        81 : "q",
        82 : "r",
        83 : "s",
        84 : "t",
        85 : "u",
        86 : "v",
        87 : "w",
        88 : "x",
        89 : "y",
        90 : "z",
        91 : "WINDOWS KEY / LEFT ⌘ / CHROMEBOOK SEARCH KEY",
        92 : "RIGHT WINDOW KEY",
        93 : "WINDOWS MENU / RIGHT ⌘",
        95: "SLEEP",
        96 : "NUMPAD 0",
        97 : "NUMPAD 1",
        98 : "NUMPAD 2",
        99 : "NUMPAD 3",
        100 : "NUMPAD 4",
        101 : "NUMPAD 5",
        102 : "NUMPAD 6",
        103 : "NUMPAD 7",
        104 : "NUMPAD 8",
        105 : "NUMPAD 9",
        106 : "MULTIPLY",
        107 : "ADD",
        108 : "NUMPAD PERIOD (FIREFOX)",
        109 : "SUBTRACT",
        110 : "DECIMAL POINT",
        111 : "DIVIDE",
        112 : "F1",
        113 : "F2",
        114 : "F3",
        115 : "F4",
        116 : "F5",
        117 : "F6",
        118 : "F7",
        119 : "F8",
        120 : "F9",
        121 : "F10",
        122 : "F11",
        123 : "F12",
        124 : "F13",
        125 : "F14",
        126 : "F15",
        127 : "F16",
        128 : "F17",
        129 : "F18",
        130 : "F19",
        131 : "F20",
        132 : "F21",
        133 : "F22",
        134 : "F23",
        135 : "F24",
        144 : "NUM LOCK",
        145 : "SCROLL LOCK",
        160 : "^",
        161 : '!',
        163 : "#",
        164 : '$',
        165 : 'ù',
        166 : "PAGE BACKWARD",
        167 : "PAGE FORWARD",
        168 : "REFRESH",
        169 : "CLOSING PAREN (AZERTY)",
        170 : '*',
        171 : "~ + * KEY",
        172 : "HOME KEY",
        173 : "MINUS (FIREFOX), MUTE/UNMUTE",
        174 : "DECREASE VOLUME LEVEL",
        175 : "INCREASE VOLUME LEVEL",
        176 : "NEXT",
        177 : "PREVIOUS",
        178 : "STOP",
        179 : "PLAY/PAUSE",
        180 : "E-MAIL",
        181 : "MUTE/UNMUTE (FIREFOX)",
        182 : "DECREASE VOLUME LEVEL (FIREFOX)",
        183 : "INCREASE VOLUME LEVEL (FIREFOX)",
        186 : "SEMI-COLON / ñ",
        187 : "EQUAL SIGN",
        188 : "COMMA",
        189 : "DASH",
        190 : "PERIOD",
        191 : "FORWARD SLASH / ç",
        192 : "GRAVE ACCENT / ñ / æ / ö",
        193 : "?, / or °",
        194 : "NUMPAD PERIOD (CHROME)",
        219 : "OPEN BRACK",
        220 : "BACK SLASH",
        221 : "CLOSE BRACKET / å",
        222 : "SINGLE QUOTE / ø / ä",
        223 : "`",
        224 : "LEFT OR RIGHT ⌘ KEY (FIREFOX)",
        225 : "altgr",
        226 : "< /git >, LEFT BACK SLASH",
        230 : "GNOME COMPOSE KEY",
        231 : "ç",
        233 : "XF86FORWARD",
        234 : "XF86BACK",
        235 : "NON-CONVERSION",
        240 : "ALPHANUMERIC",
        242 : "HIRAGANA/KATAKANA",
        243 : "HALF-WIDTH/FULL-WIDTH",
        244 : "KANJI",
        255 : "TOGGLE TOUCHPAD"
    };

    public constructor(cookieService: CookieService) {
        var savedMapping = cookieService.get("nesp2p-controller-mapping");
        if(savedMapping == undefined || savedMapping.length == 0) return;
        this.keyboardMap = JSON.parse(savedMapping);
    }

    getMapping(device: InputDevice) {
        if(this.mapping[device.id] == undefined) {
            this.mapping[device.id] = this.getDefaultMapping(device);
        } 
        return this.mapping[device.id];
    }

    setMapping(device: InputDevice, map: any[]) {
        this.mapping[device.id] = map;
    }

    private getDefaultMapping(device: InputDevice) {
        if(device.isGamepad) return this.gamepadMap;
        return this.keyboardMap;
    }
}