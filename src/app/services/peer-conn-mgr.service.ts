import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

//import * as Peer from 'peerjs';
import Peer from "peerjs";
import { environment } from '../../environments/environment';

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
      {
        urls: [ "stun:us-turn3.xirsys.com" ]
        }, {
            username: "wx-AvQEZ8sZzzwuX6TAqV6UenC9_JeNEkK1tlD-hHC3kFtHmEmchTDUpAbROl6tLAAAAAF6qQclidXNobWFu",
            credential: "3ad1322e-8a90-11ea-b626-2ab41d49acc5",
            urls: [
                "turn:us-turn3.xirsys.com:80?transport=udp",
                "turn:us-turn3.xirsys.com:3478?transport=udp",
                "turn:us-turn3.xirsys.com:80?transport=tcp",
                "turn:us-turn3.xirsys.com:3478?transport=tcp",
                "turns:us-turn3.xirsys.com:443?transport=tcp",
                "turns:us-turn3.xirsys.com:5349?transport=tcp"
            ]
        }
    ]};
    this.peer_game = new Peer(this.key_game, { config: config, host: environment.peerjs_url, port: environment.peerjs_port, path: environment.peerjs_path });
    this.peer_data = new Peer(this.key_data, { config: config, host: environment.peerjs_url, port: environment.peerjs_port, path: environment.peerjs_path });
    this.peer_cam = new Peer(this.key_cam, { config: config, host: environment.peerjs_url, port: environment.peerjs_port, path: environment.peerjs_path });

    // listen for all data connections
    this.peer_data.on('connection', conn => {
      conn.on('data', data => {
        this.onDataReceived(data);
      });
    });

    // listen for all game connections
    this.peer_game.on('call', call => {
      this.onGameReceived(call);
    });

    // listen for all webcam connections
    this.peer_cam.on('call', call => {
      this.onCamReceived(call);
    });
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