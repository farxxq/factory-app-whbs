import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../providers/authService/auth-service';
import { DataService } from '../../providers/dataService/data-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  constructor(
    public authService: AuthService,
    public dataService: DataService
  ) {}

  loginData = {
    username: '',
    password: '',
  };

  addDefaultTemp() {
    this.loginData = {
      username: 'mesadmin',
      password: 'G@nneT#25',
    };

    // this.loginData = {
    //   username: 'selvakumar',
    //   password: 'welcome',
    // };
  }

  addUserTemp() {
    this.loginData = {
      username: 'balaied@whitehouseindia.com',
      password: 'pdkied'
    }
  }

  ngOnInit() {}

  loginUser() {
    this.authService.login(this.loginData);
    console.log(this.loginData);
  }
}
