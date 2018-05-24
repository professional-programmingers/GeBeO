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

  private socket;
  names: string[] = [];

  ngOnInit() {
    this.socket = io.connect('http://localhost');
    this.http.get<string[]>('api/queue').subscribe(resp => this.names = resp);
  }

}
