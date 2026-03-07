import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../providers/authService/auth-service';
import { DataService } from '../../../providers/dataService/data-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { ReusableService } from 'src/app/providers/reusables/reusable-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  isSetIp: boolean = false;
  ip: any = 'https://pdkgannet.whindia.in/';

  constructor(
    public authService: AuthService,
    public dataService: DataService,
    public storageService: StorageService,
    private reusableService: ReusableService
  ) { }

  ngOnInit() {
    let data = this.storageService.getData('ip');

    if (!data) {
      let alert = {
        msg: `Please inform Admin to setup IP`,
      }

      this.reusableService.showAlert(alert);
      console.error('no ip found');
      return;
    }
  }

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

  ipSection() {
    if (this.loginData.username == '') {
      this.loginData.username = 'admin',
        this.loginData.password = 'admin_setip@123'
    }
  }

  setIp() {
    if (this.ip) {
      this.storageService.setData('ip', this.ip);
      let data = this.storageService.getData('ip');

      if (!data) {
        let toast = {
          message: `Error in setting up IP`,
          color: 'danger'
        }

        this.reusableService.showToast(toast);
        console.error('Error in saving ip to storage try again');
        return;
      }

      this.isSetIp = false;

      let toast = {
        message: `${this.ip} ip address has been set`,
        color: 'success',
        position: 'middle'
      }

      this.reusableService.showToast(toast);
    }
  }

  loginUser() {
    if (this.loginData.username == 'admin' && this.loginData.password == 'admin_setip@123') {
      this.isSetIp = true;
      this.loginData = {
        username: '',
        password: ''
      }
      return;
    }

    let ip = this.storageService.getData('ip');
    if (ip) {
      this.authService.login(this.loginData);
    } else {
      let alert = {
        msg: 'Please ask Admin to set the IP before logging in'
      }

      this.reusableService.showAlert(alert);
    }
    console.log(this.loginData);
  }
}
