import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as Peer from 'peerjs';
import { environment } from '../../environments/environment';
import { error } from 'util';

@Injectable()
export class PeerConnectionMgrService {
  private initialized: boolean = false;
  private dataReceivedMsgSource = new BehaviorSubject<string>("");
  private gameReceivedMsgSource = new BehaviorSubject<string>("");
  private camReceivedMsgSource = new BehaviorSubject<string>("");

  private key_data: string;
  private key_game: string;
  private key_cam: string;
  private peer_data: Peer;
  private peer_game: Peer;
  private peer_cam: Peer;

  dataReceived = this.dataReceivedMsgSource.asObservable();
  gameReceived = this.gameReceivedMsgSource.asObservable();
  camReceived = this.camReceivedMsgSource.asObservable();

  constructor() { }

  onInit() {
    if(this.initialized) return;
    this.initialized = true;

    this.key_data = this.generate_peer_id();
    this.key_game = this.generate_peer_id();
    this.key_cam = this.generate_peer_id();

    var config = {'iceServers': [
      { url: 'stun:stun1.l.google.com:19302' },
      { url: 'stun:69.243.176.245:3478', credential: 'wTWPlnm', username: 'nes' },
      { url: 'turn:69.243.176.245:3478', credential: 'wTWPlnm', username: 'nes' }
    ]};
    this.peer_game = new Peer(this.key_game, { config: config, host: environment.peerjs_url, port: environment.peerjs_port, path: environment.peerjs_path });
    this.peer_data = new Peer(this.key_data, { config: config, host: environment.peerjs_url, port: environment.peerjs_port, path: environment.peerjs_path });
    this.peer_cam = new Peer(this.key_cam, { config: config, host: environment.peerjs_url, port: environment.peerjs_port, path: environment.peerjs_path });

    // listen for all data connections
    this.peer_data.on('connection', function (conn) {
      conn.on('data', data => {
        this.onDataReceived(data);
      }, this);
    }, this);

    // listen for all game connections
    this.peer_game.on('call', function(call) {
      this.onGameReceived(call);
    }, this);

    // listen for all webcam connections
    this.peer_cam.on('call', function(call) {
      this.onCamReceived(call);
    }, this);
  }

  GetKey(type: ConnectionType): string {
    if(!this.initialized) throw new Error('PeerConnMgr Service has not been initialized.');
    switch(type) {
      case ConnectionType.DATA:
        return this.key_data;
      case ConnectionType.GAME:
        return this.key_game;
      case ConnectionType.CAM:
        return this.key_cam;
      default:
        throw new Error('Undefiend ConnectionType provided.');
    }
  }

  GetPeer(type: ConnectionType): Peer {
    if(!this.initialized) throw new Error('PeerConnMgr Service has not been initialized.');
    switch(type) {
      case ConnectionType.DATA:
        return this.peer_data;
      case ConnectionType.GAME:
        return this.peer_game;
      case ConnectionType.CAM:
        return this.peer_cam;
      default:
        throw new Error('Undefiend ConnectionType provided.');
    }
  }

  private onDataReceived(data: string) {
    this.dataReceivedMsgSource.next(data);
  }

  private onGameReceived(call: any) {
    this.gameReceivedMsgSource.next(call);
  }

  private onCamReceived(call: any) {
    this.camReceivedMsgSource.next(call);
  }

  private generate_peer_id() {
    return Math.random().toString(36).substring(5);
  }  
}

export enum ConnectionType {
  DATA = 1,
  GAME,
  CAM
}