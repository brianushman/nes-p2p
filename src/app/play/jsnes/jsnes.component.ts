import { Component, OnInit, OnDestroy, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import FrameTimer from "./frame-timer";
import Speakers from "./speakers";
import { NES, Controller } from "jsnes";
import { GamepadService, InputButton } from '../../services/gamepad.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'jsnes',
  templateUrl: './jsnes.component.html',
  styleUrls: ['./jsnes.component.css']
})
export class JsnesComponent implements OnInit {

  @Input() url: string;
  @Output() onLoaded = new EventEmitter<void>();

  state = {
    running: false,
    paused: false,
    controlsModal: false
  };

  context: any;
  canvas: any;
  imageData: any;
  fpsInterval: any;
  buf: any;
  buf8: any;
  buf32: any;
  props: any;
  nes: NES;
  frameTimer: FrameTimer;
  speakers: Speakers;
  isFullscreen: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private http: HttpClient,
    private gamepadService: GamepadService,
    private gamestateService: GameStateService
  ) { }

  ngOnInit() {
    this.initCanvas();
    this.componentDidMount();
    setTimeout(() => { // need to wait for the speakers to initialize
      this.onLoaded.emit();
    }, 1000);

    this.gamestateService.volume.subscribe(volume => {
      $("#jsnes-audio").prop('muted', !volume);
    });

    this.gamestateService.fullscreen.subscribe(expanded => {
      this.isFullscreen = expanded;
      if(expanded) {
        $(this.elementRef.nativeElement).addClass("fullscreen-canvas");
        $(".game-control").addClass("fullscreen-controls");
      }
      else {
        $(this.elementRef.nativeElement).removeClass("fullscreen-canvas");
        $(".game-control").removeClass("fullscreen-controls");
      }
      this.layout();
    });
  }

  ngOnDestroy() {
    this.stop();
    window.removeEventListener("resize", this.layout);
  }

  initCanvas() {
    this.canvas = document.getElementById('jsnes-canvas');
    this.context = this.canvas.getContext("2d");
    this.imageData = this.context.getImageData(0, 0, 256, 240);

    this.context.fillStyle = "black";
    // set alpha to opaque
    this.context.fillRect(0, 0, 256, 240);

    // buffer to write on next animation frame
    this.buf = new ArrayBuffer(this.imageData.data.length);
    // Get the canvas buffer in 8bit and 32bit
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);

    // Set alpha
    for (var i = 0; i < this.buf32.length; ++i) {
      this.buf32[i] = 0xff000000;
    }
  }

  loadBinary(path, callback) {
    var req = new XMLHttpRequest();
    req.open("GET", path);
    req.overrideMimeType("text/plain; charset=x-user-defined");
    req.addEventListener('load', function() {
      if (req.status === 200) {
        callback(null, this.responseText);
      } else {
        callback(new Error(req.statusText));
      }
    });
    req.onerror = function() {
      callback(new Error(req.statusText));
    };
    req.send();
  }

  setBuffer = buffer => {
    var i = 0;
    for (var y = 0; y < 240; ++y) {
      for (var x = 0; x < 256; ++x) {
        i = y * 256 + x;
        // Convert pixel from NES BGR to canvas ABGR
        this.buf32[i] = 0xff000000 | buffer[i]; // Full alpha
      }
    }
  };

  writeBuffer = () => {
    this.imageData.data.set(this.buf8);
    this.context.putImageData(this.imageData, 0, 0);
  };

  fitInParent = () => {
    let parent = this.canvas.parentNode;
    let parentWidth = Math.round($(parent).width());
    let padding = this.isFullscreen ? 1.0 : 0.95;
    let parentHeight = Math.round(($(window).height() - $(this.canvas.parentNode).offset().top) * padding);
    let parentRatio = parentWidth / parentHeight;
    let desiredRatio = 256 / 240;
    if (desiredRatio < parentRatio) {
      this.canvas.style.width = `${Math.round(parentHeight * desiredRatio)}px`;
      this.canvas.style.height = `${parentHeight}px`;
    } else {
      this.canvas.style.width = `${parentWidth}px`;
      this.canvas.style.height = `${Math.round(parentWidth / desiredRatio)}px`;
    }
  };

  screenshot() {
    var img = new Image();
    img.src = this.canvas.toDataURL("image/png");
    return img;
  }

  handleMouseDown = (e) => {
    let rect = this.canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.round(x / (this.canvas.clientWidth / 256));
    y = Math.round(y / (this.canvas.clientHeight / 240));
    
    this.nes.zapperMove(x, y);
    this.nes.zapperFireDown();
  };

  handleMouseUp = (e) => {
    this.nes.zapperFireUp();
  };

  componentDidMount() {
    this.speakers = new Speakers({
      onBufferUnderrun: (actualSize, desiredSize) => {
        if (!this.state.running || this.state.paused) {
          return;
        }
        // Skip a video frame so audio remains consistent. This happens for
        // a variety of reasons:
        // - Frame rate is not quite 60fps, so sometimes buffer empties
        // - Page is not visible, so requestAnimationFrame doesn't get fired.
        //   In this case emulator still runs at full speed, but timing is
        //   done by audio instead of requestAnimationFrame.
        // - System can't run emulator at full speed. In this case it'll stop
        //    firing requestAnimationFrame.
        //console.log(
        //  "Buffer underrun, running another frame to try and catch up"
        //);
        this.nes.frame();
        // desiredSize will be 2048, and the NES produces 1468 samples on each
        // frame so we might need a second frame to be run. Give up after that
        // though -- the system is not catching up
        if (this.speakers.buffer.size() < desiredSize) {
          //console.log("Still buffer underrun, running a second frame");
          this.nes.frame();
        }
      }
    });
    this.nes = new NES({
      onFrame: this.setBuffer,
      onStatusUpdate: console.log,
      onAudioSample: this.speakers.writeSample
    });

    this.frameTimer = new FrameTimer({
      onGenerateFrame: this.nes.frame,
      onWriteFrame: this.writeBuffer
    });

    this.gamepadService.changed.subscribe(value => {
      if(value == null) return;
      if(value.pressed) {
        this.nes.buttonDown(value.player, value.button);
      }
      else {
        this.nes.buttonUp(value.player, value.button);
      }
    });

    document.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mouseup", this.handleMouseUp);

    window.addEventListener("resize", this.layout);
    this.layout();

    this.load();
  }

  load = () => {
    this.loadBinary(this.url, (err, data) => {
      if (err) {
        window.alert(`Error loading ROM: ${err.toString()}`);
      } else {
        this.handleLoaded(data);
      }
    });
  };

  handleLoaded = data => {
    this.state.running = true;
    //this.setState({ uiEnabled: true, running: true });
    this.nes.loadROM(data);
    this.start();
  };

  start = () => {
    this.frameTimer.start();
    this.speakers.start();
    this.fpsInterval = setInterval(() => {
      //console.log(`FPS: ${this.nes.getFPS()}`);
    }, 1000);
  };

  stop = () => {
    this.frameTimer.stop();
    this.speakers.stop();
    clearInterval(this.fpsInterval);
  };

  handlePauseResume = () => {
    if (this.state.paused) {
      this.state.paused = false;
      //this.setState({ paused: false });
      this.start();
    } else {
      this.state.paused = true;
      //this.setState({ paused: true });
      this.stop();
    }
  };

  layout = () => {
    this.fitInParent();
  };

  toggleControlsModal = () => {
    this.state.controlsModal = !this.state.controlsModal;
    //this.setState({ controlsModal: !this.state.controlsModal });
  };
}
