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
  soundNames: string[] = [];
  header: string = null;

  ngOnInit() {
    this.socket = io.connect('http://localhost');
    this.socket.on('update queue', (queue, playing, vcname) => {
      console.log('update received');
      if (queue != null && playing != null) {
        this.soundNames = [playing];
        this.soundNames = this.soundNames.concat(queue);  
      } else {
        this.soundNames = [];
      }

      if (vcname == null) {
        this.header = 'Where you at 👀';
      } else {
        if (playing == null) {
          this.header = 'Chillin in ' + vcname + ' ❄️';
        } else {
          this.header = 'Jammin\' out in ' + vcname + ' 🎶'
        }
      }
    })
  }
}
