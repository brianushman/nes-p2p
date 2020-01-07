import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';

import { VideoChatComponent } from '../video-chat/video-chat.component';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'ws-canvas',
  templateUrl: './ws-canvas.component.html',
  styleUrls: ['./ws-canvas.component.css']
})
export class WsCanvasComponent implements OnInit, OnDestroy {

  isFullscreen: boolean = false;
  canvas: any;
  userVolumeSubscription: any;
  userFullscreenSubscription: any;

  constructor(
    private elementRef: ElementRef,
    private gsService: GameStateService
  ) { }

  ngOnInit() {
    this.canvas = document.getElementById("palette");

    this.userVolumeSubscription = this.gsService.volume.subscribe(volume => {
      $("#palette").prop('muted', !volume);
    });

    this.userFullscreenSubscription = this.gsService.fullscreen.subscribe(expanded => {
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

    window.addEventListener("resize", this.layout.bind(this));
  }

  ngOnDestroy() {
    this.userVolumeSubscription.unsubscribe();
    this.userFullscreenSubscription.unsubscribe();
    window.removeEventListener("resize", this.layout.bind(this));
    
    var canvas:any = document.getElementById("palette");
    canvas.srcObject = null;
    $(canvas).css('background-color', 'black');
  }

  private layout() {
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
  }
}
