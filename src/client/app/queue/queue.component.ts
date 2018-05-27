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
  sound: string = '';
  nowPlaying: string = null;
  queue: string[] = [];
  header: string = null;
  inVc: boolean = false;
  clearButtonColor: string = 'primary';
  clearButtonText: string = 'Clear All';
  skipButtonColor: string = 'primary';
  skipButtonText: string = 'Skip';

  ngOnInit() {
    this.socket = io.connect('http://gebeo.jmalexan.com');
    this.socket.on('update queue', (queue, playing, vcname) => {
      this.clearButtonColor = 'primary';
      this.clearButtonText = 'Clear All';
      this.skipButtonColor = 'primary';
      this.skipButtonText = 'Skip';
      if (queue != null && playing != null) {
        this.nowPlaying = playing;
        this.queue = queue;
      } else {
        this.nowPlaying = null;
        this.queue = [];
      }

      if (vcname == null) {
        this.inVc = false;
        this.header = '👀 Where you at';
        this.sound = '';
      } else {
        this.inVc = true;
        if (playing == null) {
          this.header = '❄️ Chillin in ' + vcname;
        } else {
          this.header = '🎶 Jammin\' out in ' + vcname;
        }
      }
    })
  }

  addToQueue() {
    this.socket.emit('queue sound', this.sound, false);
    this.sound = '';
  }

  queueNext() {
    this.socket.emit('queue sound', this.sound, true);
    this.sound = '';
  }

  skipSound() {
    if (this.skipButtonColor == 'primary') {
      this.skipButtonColor = 'warn';
      this.skipButtonText = 'Are you sure?';
    } else {
      this.skipButtonColor = 'primary';
      this.skipButtonText = 'Skip';
      this.socket.emit('skip sound');
    }
  }

  clearAll() {
    if (this.clearButtonColor == 'primary') {
      this.clearButtonColor = 'warn';
      this.clearButtonText = 'Are you sure?';
    } else {
      this.clearButtonColor = 'primary';
      this.clearButtonText = 'Clear All';
      this.socket.emit('clear all');
    }
  }
}
