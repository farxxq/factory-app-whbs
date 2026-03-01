import { Injectable } from '@angular/core';
//services
import { DataService } from '../dataService/data-service';
//http
import { HttpClient } from '@angular/common/http';
//Nav
import { NavController } from '@ionic/angular';
import { StorageService } from '../storage/storage-service';
import { ReusableService } from '../reusables/reusable-service';

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
  }

  constructor(
    public storageService: StorageService,
    public http: HttpClient,
    public navCtrl: NavController,
    private reusableService: ReusableService
  ) { }

  login(userData: any) {
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

            userData = ''

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
        }
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
    if (!user) {
      this.navCtrl.navigateRoot(['/login']);
      console.log('logout horaha islogin se');
      let toast = {
        message: '⚠️ Please login',
        color: 'danger'
      }

      this.reusableService.showToast(toast);
      return;
    }
    return user.role;
  }

  getUserRole(role: string) {
    for (const [user, roles] of Object.entries(this.prescribedUserRole)) {
      let rolesArr = roles as String
      if (rolesArr.includes(role)) {
        this.userRole = user
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
