import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NesModal } from './app.modal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable()
export class AppComponent implements OnInit {
  
  constructor (
    private http: HttpClient
  ) {}
    
  ngOnInit() {
  }

  send_invite() {
    new NesModal().send_invite(this.http);
  }
  
}