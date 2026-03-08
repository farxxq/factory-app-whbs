import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../providers/authService/auth-service';
import { DataService } from '../../../providers/dataService/data-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { ReusableService } from 'src/app/providers/reusables/reusable-service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  username: string = '';
  userData: any = {};

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    public navCtrl: NavController,
    private reusableService: ReusableService,
    private dataService: DataService,
  ) {}

  ngOnInit() {}

  getUser() {
    this.userData = this.storageService.getData('userData');
    if (this.userData) this.username = this.userData.username;
  }

  canLogout() {
    let alert = {
      msg: 'Do you want to logout?',
      btn: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          role: 'confirm',
          func: () => {
            this.logout();
          },
        },
      ],
    };

    this.reusableService.showAlert(alert);
  }

  logout() {
    this.authService.logout();
    // this.showMenu = false;
    console.log('Logged out');
  }

  isCheckOut = false;
  id: any = '';
  canCheckout() {
    let rfid = this.storageService.getData('rfid');

    if (rfid.operator) {
      this.isCheckOut = true;
      rfid.operator = null;
      this.storageService.setData('rfid', rfid);
      console.log('Checked out');
      let toast = {
        msg: `${this.id} has been checked out`,
        color: 'warning',
        position: 'middle',
      };

      this.reusableService.showToast(toast);
    }
    // else {
    //   rfid.operator = this.id;
    //   this.storageService.setData('rfid', rfid);
    //   let toast = {
    //     msg: `${this.id} has been Checked In`,
    //     color: 'success',
    //   };

    //   this.reusableService.showToast(toast);
    // }
  }
}
