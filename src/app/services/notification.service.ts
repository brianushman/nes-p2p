import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import * as Rx from 'rxjs/Rx';

import { environment } from '../../environments/environment';

@Injectable()
export class NotificationService {

  private id: string;

  constructor(private socket: Socket) {
    this.id = this.generate_id();
  }

  get_id(): any {
      return this.id;
  }

  public recvMessages = () => {
    return Observable.create((observer) => {
      this.socket.on('message', (message) => {
          observer.next(message);
      });
    });
  }

  public sendMessage(message) {
    this.socket.emit('message', message);
  }

  /*connect(): any {
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
    return Subject.create(observer, observable);
  }*/

  disconnect() {
    this.socket.disconnect();
  }

  private generate_id() {
    return Math.random().toString(36).substring(5);
  }
}