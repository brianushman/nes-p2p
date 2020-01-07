import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';

import { environment } from '../../environments/environment';

@Injectable()
export class NotificationService {

  private id: string;
  private socket;

  constructor() {
    this.id = this.generate_id();
  }

  get_id(): any {
      return this.id;
  }

  connect(): Rx.Subject<MessageEvent> {
    if(environment.production) {
      this.socket = io(environment.socketio, { secure: true, reconnect: true, rejectUnauthorized : false });
    }
    else {
      this.socket = io(environment.socketio);
    }

    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    let observable = new Observable(observer => {
        this.socket.on('message', (data) => {
          console.log("Received message from Websocket Server")
          observer.next(data);
        })
        return () => {
          this.socket.disconnect();
        }
    });
    
    // We define our Observer which will listen to messages
    // from our other components and send messages back to our
    // socket server whenever the `next()` method is called.
    let observer = {
        next: (data: Object) => {
            this.socket.emit('message', data);
        },
    };

    // we return our Rx.Subject which is a combination
    // of both an observer and observable.
    return Rx.Subject.create(observer, observable);
  }

  disconnect() {
    this.socket.disconnect();
  }

  private generate_id() {
    return Math.random().toString(36).substring(5);
  }
}