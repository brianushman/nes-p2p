import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AudioContextModule } from 'angular-audio-context';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxCarousel3dModule }  from '../ngx-carousel-3d/ngx-carousel-3d.module';

import { GameModeSelectComponent } from './game-mode-select/game-mode-select.component';
import { GameSelectComponent } from './game-select/game-select.component';
import { ControlMappingsComponent } from './control-mappings/control-mappings.component';
import { LobbyComponent } from './lobby/lobby.component';

import { CommonNesModule } from '../common-nes/common-nes.module';

import { NotificationService } from '../services/notification.service';
import { GameDetailsService } from '../services/game-details.service';
import { GamepadService } from '../services/gamepad.service';
import { PeerConnectionMgrService } from '../services/peer-conn-mgr.service';

import { OfflineLobbyComponent } from './offline-lobby/offline-lobby.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    AudioContextModule.forRoot('balanced'),
    BrowserAnimationsModule,
    CommonNesModule,
    NgxCarousel3dModule
  ],
  declarations: [
    GameModeSelectComponent,
    GameSelectComponent,
    ControlMappingsComponent,
    LobbyComponent,
    OfflineLobbyComponent
  ],
  exports: [
    GameModeSelectComponent,
    LobbyComponent
  ],
  providers: [NotificationService, GameDetailsService, GamepadService, PeerConnectionMgrService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SetupModule { }
