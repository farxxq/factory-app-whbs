import { Component, OnInit, ViewChild } from '@angular/core';
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
  ip: any = '';

  @ViewChild('swiper') swiper: any;

  constructor(
    public authService: AuthService,
    public dataService: DataService,
    public storageService: StorageService,
    private reusableService: ReusableService,
  ) {}

  ngOnInit() {
    this.ip = this.storageService.getData('ip');

    if (!this.ip) {
      let alert = {
        msg: `Please inform Admin to setup IP`,
        btn: [
          {
            text: 'OK',
            func: () => {},
          },
        ],
      };

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
      password: 'pdkied',
    };
  }

  ipSection(ip?: string) {
    if (ip) {
      this.ip = 'pdkgannet.whindia.in';
    }
    this.loginData.username = 'admin';
    this.loginData.password = 'admin_setip@123';
  }

  setIp() {
    if (this.ip) {
      if (this.ip == 'localip') {
        this.storageService.setData('ip', 'http://192.168.16.127/gannet_v5/');
      } else {
        this.storageService.setData('ip', this.ip);
      }
      let data = this.storageService.getData('ip');

      if (!data) {
        let toast = {
          message: `Error in setting up IP`,
          color: 'danger',
        };

        this.reusableService.showToast(toast);
        console.error('Error in saving ip to storage try again');
        return;
      }

      this.isSetIp = false;

      let toast = {
        message: `${this.ip} ip address has been set`,
        color: 'success',
        position: 'middle',
      };

      this.reusableService.showToast(toast);
    }
  }

  loginUser() {
    let isAdmin =
      this.loginData.username == 'admin' &&
      this.loginData.password == 'admin_setip@123';
    if (isAdmin) {
      this.isSetIp = true;
      this.loginData = {
        username: '',
        password: '',
      };
      return;
    }

    let ip = this.storageService.getData('ip');

    if (ip) {
      this.authService.login(this.loginData);
    } else {
      let alert = {
        msg: 'Please ask Admin to set the IP before logging in',
      };

      this.reusableService.showAlert(alert);
    }
    console.log(this.loginData);
  }

  //slides
  slideChange(e: any) {
    console.log('slide changed', e);
    this.loginData = {
      username: '',
      password: '',
    };
  }

  goToSlide(index: number) {
    this.swiper?.nativeElement.swiper.slideTo(index);
  }
}
