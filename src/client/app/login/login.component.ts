import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginUrl: string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      let clientid = params['clientid'];
      this.loginUrl = 'https://discordapp.com/api/oauth2/authorize?response_type=code&client_id=' + clientid + '&scope=identify&redirect_uri=' + encodeURIComponent(window.location.origin) + '%2Fredirect'
    });
  }

  ngOnInit() {
  }

}
