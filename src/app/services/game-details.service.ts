import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { GameRequestModel } from '../setup/lobby/lobby.model';

@Injectable()
export class GameDetailsService {
  private msgSource = new BehaviorSubject<GameRequestModel>(null);
  details = this.msgSource.asObservable();

  constructor() { }
  
  update(request: GameRequestModel) {
    this.msgSource.next(request);
  }
}