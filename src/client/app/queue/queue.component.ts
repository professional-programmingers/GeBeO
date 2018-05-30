import { Component, OnInit } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

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
  queue: string[] = null;
  header: string = null;
  inVc: boolean = false;
  clearButtonColor: string = 'primary';
  clearButtonText: string = 'Clear All';
  skipButtonColor: string = 'primary';
  skipButtonText: string = 'Skip';
  ytSearchEnabled: boolean = false;
  inputPlaceholder: string = 'Sound to queue';
  videos: any = null;

  ngOnInit() {
    this.socket = io.connect(window.location.origin);
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
        this.queue = null;
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

  addYtToQueue(url: string) {
    this.socket.emit('queue sound', url, false);
    this.videos = null;
  }

  queueYtNext(url: string) {
    this.socket.emit('queue sound', url, true);
    this.videos = null;
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

  updateYtSearch() {
    console.log(this.ytSearchEnabled);
    if (this.ytSearchEnabled) {
      this.inputPlaceholder = 'What to search for';
    } else {
      this.videos = null;
      this.inputPlaceholder = 'Sound to queue';
    }
  }

  searchYt() {
    this.http.get('/api/ytget', {
      params: new HttpParams({
        fromObject: {search: this.sound}
      })
    }).subscribe(videos => {
      this.videos = videos;
    });
  }

  queueYt(url: string) {

  }
}
