import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class GameStateService {
  private volumeMsgSource = new BehaviorSubject<boolean>(true);
  private fullscreenMsgSource = new BehaviorSubject<boolean>(false);
  private chatMsgSource = new BehaviorSubject<ChatSettings>(new ChatSettings({ video: false, audio: false}));
  volume = this.volumeMsgSource.asObservable();
  fullscreen = this.fullscreenMsgSource.asObservable();
  chat = this.chatMsgSource.asObservable();

  constructor() { }

  updateSound(volume_on: boolean) {
    this.volumeMsgSource.next(volume_on);
  }

  updateFullscreen(expanded: boolean) {
    this.fullscreenMsgSource.next(expanded);
  }

  updateChatSettings(settings: ChatSettings) {
    this.chatMsgSource.next(settings);
  }
}

export class ChatSettings {
  video: boolean;
  audio: boolean;

  public constructor(init?:Partial<ChatSettings>) {
      Object.assign(this, init);
  }
}