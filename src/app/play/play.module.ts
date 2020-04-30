import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverModule } from "ngx-smart-popover";

import { NotificationService } from '../services/notification.service';
import { GameDetailsService } from '../services/game-details.service';
import { GameStateService } from '../services/game-state.service';
import { PeerConnectionMgrService } from '../services/peer-conn-mgr.service';

import { JsnesComponent } from './jsnes/jsnes.component';
import { PlayGameComponent } from './play-game/play-game.component';
import { WsCanvasComponent } from './ws-canvas/ws-canvas.component';
import { VideoChatComponent } from './video-chat/video-chat.component';
import { GameControlsComponent } from './game-controls/game-controls.component';
import { MobileGamepadComponent } from './mobile-gamepad/mobile-gamepad.component';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule
  ],
  declarations: [
    JsnesComponent,
    PlayGameComponent,
    WsCanvasComponent,
    VideoChatComponent,
    GameControlsComponent,
    MobileGamepadComponent
  ],
  exports: [
    PlayGameComponent,
    GameControlsComponent
  ],
  providers: [NotificationService, GameDetailsService, GameStateService, PeerConnectionMgrService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PlayModule { }
