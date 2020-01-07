import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { PeerConnectionMgrService, ConnectionType } from '../../services/peer-conn-mgr.service';
import { GameDetailsService } from '../../services/game-details.service';
import { GameStateService, ChatSettings } from '../../services/game-state.service';
import { GameRequestModel } from '../../setup/lobby/lobby.model';
import { environment } from '../../../environments/environment';

import * as Peer from 'peerjs';

@Component({
  selector: 'video-chat',
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css']
})
export class VideoChatComponent implements OnInit, OnDestroy {

  private isHost: boolean;
  private game_details: GameRequestModel;
  private local_stream: any;
  private remote_stream: any;
  private callReceivedSubscription: any;

  local_video_enabled: boolean = true;
  local_audio_enabled: boolean = true;
  remote_video_enabled: boolean;
  remote_audio_enabled: boolean;

  @Input() localName: string;
  @Input() remoteName: string;
  @Output() onChatUpdated = new EventEmitter<ChatSettings>();

  constructor(
    private gdService: GameDetailsService,
    private gsService: GameStateService,
    private peerConnMgrService: PeerConnectionMgrService
  ) { }

  ngOnInit() {
    this.gdService.details.subscribe(data => this.game_details = data);
    this.game_details = new GameRequestModel({
      local_user_name: this.game_details.local_user_name,
      requester: this.game_details.requester,
      recipient: this.game_details.recipient,
      game: this.game_details.game
    });

    this.gsService.chat.subscribe(settings => {
      this.remote_video_enabled = settings.video;
      this.remote_audio_enabled = settings.audio;
    });
    
    this.isHost = (this.game_details.requester == this.game_details.local_user());
    
    this.isHost = (this.game_details.requester == this.game_details.local_user());
    var config = {'iceServers': [
      { url: 'stun:stun1.l.google.com:19302' },
      { url: 'stun:69.243.176.245:3478', credential: 'wTWPlnm', username: 'nes' },
      { url: 'turn:69.243.176.245:3478', credential: 'wTWPlnm', username: 'nes' }
    ]};

    if(this.isHost){
      this.connect();
    }
    else {
      this.callReceivedSubscription = this.peerConnMgrService.camReceived.subscribe(this.listen.bind(this));
    }
  }

  ngOnDestroy() {
    if(this.callReceivedSubscription) this.callReceivedSubscription.unsubscribe();
    
    let stream = this.local_stream;
    if(stream != undefined && stream != null) {
      let tracks = stream.getTracks();
    
      tracks.forEach(function(track) {
        track.stop();
      });
    }
  }

  connect() {
    this.getMedia((stream) => {
      var call = this.peerConnMgrService.GetPeer(ConnectionType.CAM).call(this.game_details.remote_user().cam_peer_id, stream);
      this.local_stream = stream;
      $('#host-video').prop('srcObject', stream);
      call.on('stream', function(remoteStream) {
        this.remote_stream = remoteStream;
        $('#peer-video').prop('srcObject', remoteStream);
        this.onChatUpdated.emit(new ChatSettings({video: this.local_video_enabled, audio: this.local_audio_enabled}));
      }.bind(this));
    });
  }

  listen(call: any) {
    this.getMedia((stream) => {
      this.local_stream = stream;
      $('#host-video').prop('srcObject', stream);
      call.answer(stream); // Answer the call with an A/V stream.
      call.on('stream', function(remoteStream) {
        this.remote_stream = remoteStream;
        $('#peer-video').prop('srcObject', remoteStream);
        this.onChatUpdated.emit(new ChatSettings({video: this.local_video_enabled, audio: this.local_audio_enabled}));
      }.bind(this));
    });
  }

  enableVideo(enabled: boolean) {
    if(this.local_stream != undefined) {
      var track = this.local_stream.getVideoTracks()[0];
      track.enabled = enabled;
      this.local_video_enabled = enabled;
      this.onChatUpdated.emit(new ChatSettings({video: this.local_video_enabled, audio: this.local_audio_enabled}));
    }
  }

  enableAudio(enabled: boolean) {
    if(this.local_stream != undefined) {
      var track = this.local_stream.getAudioTracks()[0];
      track.enabled = enabled;
      this.local_audio_enabled = enabled;
      this.onChatUpdated.emit(new ChatSettings({video: this.local_video_enabled, audio: this.local_audio_enabled}));
    }
  }

  private getMedia(callback: Function) {
    var navigator:any = window.navigator;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var constraints = {
      audio: true,
      video: {
        quality: 4,
        width: { ideal: 170 },
        height: { ideal: 96 }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(callback).catch(this.mediaStreamError);
  }

  private mediaStreamError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

}
