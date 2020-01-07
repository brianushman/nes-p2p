import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameSelectComponent } from '../game-select/game-select.component';
import { ControllerSelectComponent } from '../../common-nes/controller-select/controller-select.component';
import { GameDetailsService } from '../../services/game-details.service';
import { GamepadService } from '../../services/gamepad.service';
import { NesModal } from '../../app.modal';

import { GameModel, GameRequestModel } from '../lobby/lobby.model';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'offline-lobby',
  templateUrl: './offline-lobby.component.html',
  styleUrls: ['./offline-lobby.component.css']
})
export class OfflineLobbyComponent implements OnInit, AfterViewInit {

  selected_rom: GameModel;

  constructor(
    private router: Router,
    private gdService: GameDetailsService,
    private gamepadService: GamepadService,
    private deviceService: DeviceDetectorService
  ) { }

  ngOnInit() {
    this.gamepadService.connect();
  }

  ngAfterViewInit() {
  }

  romChanged(rom: GameModel) {
    this.selected_rom = rom;
  }

  play() {
    var request = new GameRequestModel({ game: this.selected_rom });
    this.gdService.update(request);
    this.router.navigateByUrl('/play-game');
  }

  GamepadService() {
    return this.gamepadService;
  }

}
