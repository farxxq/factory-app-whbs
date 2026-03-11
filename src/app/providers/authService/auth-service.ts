import { Injectable } from '@angular/core';
//services
import { DataService } from '../dataService/data-service';
import { StorageService } from '../storage/storage-service';
import { ReusableService } from '../reusables/reusable-service';
//http
import { HttpClient } from '@angular/common/http';
//Nav
import { NavController } from '@ionic/angular';
//device details
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //apiurl
  apiUrl: any = 'https://gannet.online/console/';

  deviceType: string;
  userRole!: string;

  prescribedUserRole: any = {
    USER1: ['ad_min'],
    USER2: ['IE'],
    USER3: ['PACKING'],
  };

  constructor(
    public storageService: StorageService,
    public http: HttpClient,
    public navCtrl: NavController,
    private reusableService: ReusableService,
    private dataService: DataService,
  ) {}

  async getDeviceInfo() {
    const info = await Device.getInfo();
    const id = await Device.getId();
    const net = await Network.getStatus();

    const deviceDetails = {
      model: info.model,
      platform: info.platform,
      version: info.osVersion,
      manufacturer: info.manufacturer,
      UUID: id.identifier,
      connectionType: net.connectionType,
      serial: 123456,
    };

    this.storageService.setData('qc_device_details', deviceDetails);
  }

  login(userData: any) {
    //setting the device info
    this.getDeviceInfo();

    let postData = new FormData();

    postData.append('username', userData.username);
    postData.append('password', userData.password);

    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + 'login/validuserlogin', postData).subscribe(
        (res: any) => {
          resolve(res);
          console.log('postData: ', postData);
          console.log('res: ', res);
          if (res['status'].toLowerCase() === 'success') {
            this.storageService.setData('userData', res['userdata']);
            this.deviceType = this.reusableService.deviceType();
            this.storageService.setData('deviceType', this.deviceType);
            let data = this.storageService.getData('userData');

            if (data) {
              this.navCtrl.navigateRoot('/');
              this.getUserRole(data.role);
              // console.log(
              //   'going to the default one or the polypack based on the device type...'
              // );
              // let device = this.storageService.getData('deviceType');
              // let branch = this.storageService.getData('userData')
              // device == 'mobile' && branch.branchcode != 0
              //   ? this.navCtrl.navigateRoot('/polypack')
              //   : this.navCtrl.navigateRoot('/');
            }
          } else {
            let toast = {
              message: res.message,
              color: 'danger',
              position: 'middle',
            };

            userData = '';

            this.reusableService.showToast(toast);
          }
        },
        async (err) => {
          console.log(err);
          let alert = {
            header: err.status > 0 ? '⚠️Error' : '🚫 Offline',
            subHeader: err.status > 0 ? `Status code: ${err.status}` : '',
            msg:
              err.status > 0
                ? err.message
                : 'Please Connect to the Internet and then try again',
          };
          this.reusableService.cancelLoading();
          this.reusableService.showAlert(alert);
          reject(err);
        },
      );
    });
  }

  logout() {
    this.storageService.removeData('userData');
    this.storageService.removeData('deviceType');
    this.navCtrl.navigateRoot(['/login']);
  }

  isLogin() {
    let user = this.storageService.getData('userData');
    let ip = this.storageService.getData('ip');
    if (!user && !ip) {
      this.navCtrl.navigateRoot(['/login']);
      console.log('logout horaha islogin se');
      let msg = ip ? '⚠️ Please set the IP address' : '⚠️ Please login';
      let toast = {
        message: msg,
        color: 'danger',
        position: 'middle',
      };

      this.reusableService.showToast(toast);
      return;
    }
    console.log(user);
    return user.role;
  }

  getUserRole(role: string) {
    for (const [user, roles] of Object.entries(this.prescribedUserRole)) {
      let rolesArr = roles as String;
      if (rolesArr.includes(role)) {
        this.userRole = user;
      }
    }

    console.log('User role:', this.userRole);
  }

  // isUserRole(role: string) {
  //   return this.userRole == role
  // }

  // hasAnyRole(role: string[]) {
  //   return role.includes(this.userRole!)
  // }
}
