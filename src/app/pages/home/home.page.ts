import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../providers/authService/auth-service';
import { DataService } from '../../providers/dataService/data-service';
import { ReusableService } from '../../providers/reusables/reusable-service';
import { StorageService } from '../../providers/storage/storage-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  deviceType: string = this.storageService.getData('deviceType');
  branchList: any = [];
  branchModel: any = '';
  userRole: string = '';
  data: any = {};

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private storageService: StorageService,
    private reusableService: ReusableService,
    private dataService: DataService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.userRole = this.authService.isLogin();
    this.data = this.storageService.getData('userData')
    this.branchModel = this.data.branchModel ? this.data.branchModel : '';
    let params = {
      path: 'material_size/getbranchlist',
    };

    this.dataService.branchService(params).then((res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.branchList = res['branchdetails'];
      }
    });

  }

  navigateTo(appName: string) {
    if (this.data.branchcode == 0) {
      let alert = {
        msg: 'Please select a branch'
      }
      this.reusableService.showAlert(alert);
    } else {

      this.navCtrl.navigateRoot([`${appName}`]);
    }
  }

  setBranch() {
    let userData = this.storageService.getData('userData');
    if (userData) {
      userData.branchcode = this.branchModel.location_seq_num;
      userData.divcode = this.branchModel.location_seq_num;
      userData.branchModel = this.branchModel
      this.data = userData;
    }
    this.storageService.setData('userData', userData);
  }


  showDeviceType() {
    confirm(this.deviceType)
  }








}
