import { Component, OnInit, OnDestroy, AfterViewInit, Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { GameSelectComponent } from '../game-select/game-select.component';
import * as io from 'socket.io-client';
import { NesModal } from '../../app.modal';
import { LobbyMessageEnum, LobbyMessage, UserDetailModel, GameModel, GameRequestModel } from './lobby.model';

import { NotificationService } from '../../services/notification.service';
import { GameDetailsService } from '../../services/game-details.service';
import { GameStateService } from '../../services/game-state.service';
import { GamepadService } from '../../services/gamepad.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PeerConnectionMgrService, ConnectionType } from '../../services/peer-conn-mgr.service';

import { environment } from '../../../environments/environment';

@Injectable()
@Component({
  selector: 'lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy, AfterViewInit {

  private socket;
  public username: string;
  lobby_active: boolean = false;
  public selected_rom: GameModel;
  public selected_opponent: UserDetailModel;
  messages: Subject<any>;
    
  users:UserDetailModel[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private nsService: NotificationService,
    private gdService: GameDetailsService,
    private gsService: GameStateService,
    private gamepadService: GamepadService,
    private deviceService: DeviceDetectorService,
    private peerConnMgrService: PeerConnectionMgrService
  ) {}

  ngOnInit() {
    this.peerConnMgrService.onInit();

    this.nsService.recvMessages().subscribe((msg: LobbyMessage) => {
      console.log(`Received Lobby Message: ${msg.message_id}`);
      if(!this.lobby_active || msg.socket_id == this.nsService.get_id()) return;
      switch(msg.message_id) {
        case LobbyMessageEnum.LobbyUser:
          this.insert_user(msg.data);
          break;
        case LobbyMessageEnum.JoinGameRequest:
          this.recv_join_request(msg.data);
          break;
        case LobbyMessageEnum.RequestStatus:
          this.rebroadcast();
          break;
        case LobbyMessageEnum.UserDisconnected:
          this.user_disconnected(msg.socket_id);
          break;
        case LobbyMessageEnum.AcceptRequest:
          this.load_game();
          break;
      }
    });

    /*this.gdService.details.subscribe(data => {
      if(data != undefined) {
        this.username = data.local_user_name;
        this.join();
      }
    });*/

    this.username = this.route.snapshot.queryParamMap.get("username");
    if(this.username != null && this.username.length > 0) {
      console.log(`Activating Lobby with user "${this.current_user().username}"`);
      this.lobby_active = true;
      this.send_message(new LobbyMessage({ message_id: LobbyMessageEnum.LobbyUser, data: this.current_user() }));
      this.send_message(new LobbyMessage({ message_id: LobbyMessageEnum.RequestStatus}));
    }
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.nsService.disconnect();
  }

  romChanged(rom: GameModel) {
    this.selected_rom = rom;
  }

  send_message(msg: LobbyMessage) {
    msg.sender = this.current_user();
    msg.socket_id = this.nsService.get_id();
    this.nsService.sendMessage(msg);
  }

  join() {
    window.location.href = `/lobby?username=${this.username}`;
  }

  rebroadcast() {
    this.send_message(new LobbyMessage({ message_id: LobbyMessageEnum.LobbyUser, data: this.current_user() }));
  }

  insert_user(user: UserDetailModel) {
    if(this.users.filter(x => x.username == user.username).length == 0) {
      this.users.push(user);
    }
  }

  send_invitation() {
    var request = new GameRequestModel({ local_user_name: this.username, game: this.selected_rom, recipient: this.selected_opponent, requester: this.current_user() });
    this.send_message(new LobbyMessage({ message_id: LobbyMessageEnum.JoinGameRequest, data: request }));
    this.gdService.update(request);
  }

  user_disconnected(session_id: string) {
    var result = this.users.filter(x => x.socket_id == session_id);
    if(result.length > 0) this.users.splice(this.users.indexOf(result[0]), 1);
  }

  recv_join_request(msg: GameRequestModel) {
    if(msg.recipient.socket_id != this.nsService.get_id()) return;
    new NesModal({
      title: `${msg.requester.username} wants to play "${msg.game.Name}" with you!`,
      timeout: 30000,
      confirmButtonText: 'Accept',
      cancelButtonText: 'Reject',
      onConfirm: () => {this.acceptInvitation(msg)},
      onCancel: () => {this.rejectInvitation()}
    }).open();
  }

  acceptInvitation(request: GameRequestModel) {
    request.local_user_name = this.username;
    this.gdService.update(request);
    this.send_message(new LobbyMessage({ message_id: LobbyMessageEnum.AcceptRequest}));
    this.load_game();
  }

  rejectInvitation() {
    alert('rejected!!');
  }

  private current_user(): UserDetailModel {
    return new UserDetailModel({ 
      username: this.username,
      render_peer_id: this.peerConnMgrService.GetKey(ConnectionType.GAME),
      data_peer_id: this.peerConnMgrService.GetKey(ConnectionType.DATA),
      cam_peer_id: this.peerConnMgrService.GetKey(ConnectionType.CAM),
      socket_id: this.nsService.get_id()
    });
  }

  private load_game() {
    this.router.navigateByUrl('/play-game');
  }

}
