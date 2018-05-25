import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import * as io from 'socket.io-client';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css']
})
export class QueueComponent implements OnInit {

  constructor(
    private http: HttpClient
  ) { }

  private socket: SocketIOClient.Socket;
  names: string[] = [];

  ngOnInit() {
    this.socket = io.connect('http://localhost');
    this.socket.on('update queue', (queue, playing) => {
      if (queue != null && playing != null) {
        this.names = [playing];
        this.names = this.names.concat(queue);  
      } else {
        this.names = null;
      }
    })
  }

}
