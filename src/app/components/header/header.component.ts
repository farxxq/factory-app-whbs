import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthService } from '../../providers/authService/auth-service';
import { DataService } from '../../providers/dataService/data-service';
import { ReusableService } from '../../providers/reusables/reusable-service';
import { StorageService } from '../../providers/storage/storage-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonicModule, CommonModule],
})
export class HeaderComponent implements OnInit {
  @Input() headerData!: string;
  @Input() homeBtn: boolean = true;
  @Input() checkoutBtn: boolean = true;
  @Input() logoutBtn: boolean = true;
  @Input() iconTray:
    | [{ iconName: string; navTo: string; color?: string; func?: any }]
    | [] = [];

  // Variables
  username: string = '';
  showMenu: boolean = false;

  isModalOpen: boolean = false;

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    public navCtrl: NavController,
    private reusableService: ReusableService,
    private dataService: DataService,
  ) {
    this.getUser();
    this.authService.isLogin();
    console.log('HeaderComponent constructed');
  }

  ngOnInit() {
    this.isModalOpen = true;
  }

  getUser() {
    let userData = this.storageService.getData('userData');
    if (userData) this.username = userData.username;
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

  isCheckIn = false;
  isCheckOut = false;
  id: any = '';
  canCheckin_out() {
    let rfid = this.storageService.getData('rfid');

    if (rfid.operator) {
      this.isCheckOut = true;
      rfid.operator = null;
      this.storageService.setData('rfid', rfid);
      console.log('Checked out');
      let toast = {
        msg: `${this.id} has been checked out`,
        color: 'warning',
      };

      this.reusableService.showToast(toast);
    } else {
      rfid.operator = this.id;
      this.storageService.setData('rfid', rfid);
      let toast = {
        msg: `${this.id} has been Checked In`,
        color: 'success',
      };

      this.reusableService.showToast(toast);
    }
  }

  closeModal() { }

  logout() {
    this.authService.logout();
    // this.showMenu = false;
    console.log('Logged out');
  }

  goToHome() {
    this.navCtrl.navigateRoot('home');
    console.log('Navigate to home');
  }

  goTo(path: string) {
    this.navCtrl.navigateForward(path);
    console.log(`Navigated to ${path}`);
  }

  iconsFunc(data: any) {
    if (data.func) {
      data.func();
      console.log('Icon function', data.func);
    }
    if (data.navTo) {
      this.goTo(data.navTo);
      console.log('Navigated to', data.navTo);
    }
  }

  apiLocal = false;
  private apiToggleLock = false;

  changeAPIURL() {
    if (this.apiToggleLock) return;
    this.apiToggleLock = true;

    this.apiLocal = !this.apiLocal;
    this.dataService.apiUrl = this.apiLocal
      // ? 'https://gannet.online/console/'
      ? 'https://pdkgannet.whindia.in'
      : 'http://192.168.16.127/gannet_v5/';

    console.log(this.dataService.apiUrl, 'header', this.apiLocal, 'apiLocal');
    let toast = {
      message: `⚠️ api change to ${this.dataService.apiUrl} by admin`,
      color: 'danger',
    };

    this.reusableService.showToast(toast);

    setTimeout(() => {
      this.apiToggleLock = false;
    }, 300);
  }
}
