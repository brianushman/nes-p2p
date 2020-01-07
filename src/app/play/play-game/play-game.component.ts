import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from "@angular/router";
import { DeviceDetectorService } from 'ngx-device-detector';

import { JsnesComponent } from '../jsnes/jsnes.component';
import { MobileGamepadComponent } from '../mobile-gamepad/mobile-gamepad.component';
import { GameRequestModel } from '../../setup/lobby/lobby.model';
import { environment } from '../../../environments/environment';
import { NesModal } from '../../app.modal';

import { GameDetailsService } from '../../services/game-details.service';
import { GamepadService, InputButton } from '../../services/gamepad.service';
import { GameStateService, ChatSettings } from '../../services/game-state.service';
import { PeerConnectionMgrService, ConnectionType } from '../../services/peer-conn-mgr.service';

import * as Peer from 'peerjs';

@Component({
  selector: 'play-game',
  templateUrl: './play-game.component.html',
  styleUrls: ['./play-game.component.scss']
})
export class PlayGameComponent implements OnInit, OnDestroy, AfterViewInit {

  private game_details: GameRequestModel;
  private conn_data: any;
  private document: any = document;
  private dataReceivedSubscription: any;
  private gameReceivedSubscription: any;
  
  isHost: boolean;
  isFullscreen: boolean = false;
  isOffline: boolean = false;
  isMobile: boolean = false;

  constructor(
    private router: Router,
    private gdService: GameDetailsService,
    private gsService: GameStateService,
    private gamepadService: GamepadService,
    private deviceService: DeviceDetectorService,
    private peerConnMgrService: PeerConnectionMgrService
  ) {}

  ngOnInit() {
    this.peerConnMgrService.onInit();
    this.isMobile = this.deviceService.isMobile();
    this.gdService.details.subscribe(data => this.game_details = data);
    this.game_details = new GameRequestModel({
      local_user_name: this.game_details.local_user_name,
      requester: this.game_details.requester,
      recipient: this.game_details.recipient,
      game: this.game_details.game
    });

    this.isOffline = (this.game_details.requester == null);
    this.isHost = this.isOffline || (this.game_details.requester == this.game_details.local_user());
    if(!this.isOffline) {
      this.conn_data = this.peerConnMgrService.GetPeer(ConnectionType.DATA).connect(this.game_details.remote_user().data_peer_id);
      this.dataReceivedSubscription = this.peerConnMgrService.dataReceived.skip(1).subscribe(this.onReceived.bind(this));
    }
  }

  ngAfterViewInit() {
    setTimeout(()=> {
      if(!this.isOffline) {
        if(this.isHost) {
          this.gameReceivedSubscription = this.peerConnMgrService.gameReceived.subscribe(this.broadcast_video.bind(this));
        }
        else {
          this.receive_video();
        }

        if(!this.isHost) {
          // send keys to peer
          this.gamepadService.changed.subscribe(value => {
            if(value == null) return;
            if(value.pressed) {
              this.conn_data.send(`keydown ${value.button}`);
            }
            else {
              this.conn_data.send(`keyup ${value.button}`);
            }
          });
        }
      }
      this.gamepadService.connect();
    }, 1000);
  }

  ngOnDestroy() {
    NesModal.CloseAll();
    if(this.dataReceivedSubscription) this.dataReceivedSubscription.unsubscribe();
    if(this.gameReceivedSubscription) this.gameReceivedSubscription.unsubscribe();
  }

  broadcast_video(call) {
    var canvas:any = this.document.getElementById('jsnes-canvas');
    var stream = canvas.captureStream(30);
    var audio:any = this.document.getElementById('jsnes-audio');
    var track = audio.captureStream(30);
    
    var alltracks = track.getTracks();
    if(alltracks.length > 0) {
      stream.addTrack(alltracks[0]);
    }
    call.answer(stream);
    call.on('stream', function(remoteStream) {
    });
  }

  play() {
    var element: any = this.document.getElementById("jsnes-audio");
    element.volume = element.volume == 1 ? 0 : 1;
  }

  receive_video() {
    var peer_id = this.game_details.remote_user().render_peer_id;
    var streamElement:any = this.document.getElementById('hidden-stream');
    const audioCtx:any = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();

    var stream = streamElement.captureStream();
    var alltracks = dest.stream.getTracks();
    if(alltracks.length > 0) {
      stream.addTrack(alltracks[0]);
    }
    this.peerConnMgrService.GetPeer(ConnectionType.GAME).call(peer_id, stream)
    .on('stream', function(remoteStream) {
      var element:any = this.document.getElementById("palette");
      element.srcObject = remoteStream;
    }.bind(this));
  }

  onReceived(msg) {
    var parts = msg.split(" ");
    var cmd = parts[0];
    var data = parts[1];

    if (cmd === "keyup" || cmd === "keydown") {
      this.gamepadService.update(new InputButton({ button: data, pressed: (cmd === "keydown"), player: 2 }));
    }
    else if(cmd === "chat") {
      console.log(data);
      var settings = JSON.parse(data);
      this.gsService.updateChatSettings(new ChatSettings({ video: settings.video==1, audio: settings.audio==1 }));
    }
    else if(cmd === "quit") {
      new NesModal({
        showDismissButton: true,
        title: `Game Ended! ${this.game_details.remote_user().username} has quit the game. You will now be returned to the lobby to play a new game.`,
        onCancel: () => {  this.router.navigateByUrl('/lobby'); }
      }).open();
    }
  };

  triggerKey(type, keyCode) {
    var e = $.Event(type);
    e.which = keyCode;
    e.keyCode = keyCode;
    $(this.document).trigger(e);
  }

  player_quit() {
    if(this.isOffline) {
      this.router.navigateByUrl('/offline-lobby');
    }
    else {
      this.conn_data.send("quit");
      this.router.navigateByUrl('/lobby');
    }
  }

  game_muted(volume: boolean) {
    this.gsService.updateSound(volume);
  }

  game_fullscreen(expanded: boolean) {
    if (!expanded && (this.document.fullscreenElement ||
      this.document.webkitFullscreenElement)) {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        this.document.webkitExitFullscreen();
      }
    } else {
      var element = $('play-game').get(0);
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element['mozRequestFullScreen']) {
        element['mozRequestFullScreen']();
      } else if (element['webkitRequestFullscreen']) {
        element['webkitRequestFullscreen']();
      }
    }
    this.isFullscreen = expanded;
    this.gsService.updateFullscreen(expanded);
  }

  romUrl() {
    return `assets/roms/${this.game_details.game.RomUrl}`;
  }

  localname() {
    return this.game_details.local_user().username;
  }

  remotename() {
    return this.game_details.remote_user().username;
  }

  chatSettingsUpdated(settings) {
    this.conn_data.send(`chat ${JSON.stringify(settings).replace(/\s/g, '')}`);
  }
}
