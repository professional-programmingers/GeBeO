import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css']
})
export class QueueComponent implements OnInit {

  constructor(
    private http: HttpClient
  ) { }

  names: string[] = [];

  ngOnInit() {
    this.http.get<string[]>('api/queue').subscribe(resp => this.names = resp);
  }

}
