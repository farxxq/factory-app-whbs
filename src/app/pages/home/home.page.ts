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

  lineList: any = [];
  lineModel = '';
  data: any = {};

  userRole: string = '';

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private storageService: StorageService,
    private reusableService: ReusableService,
    private dataService: DataService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.userRole = this.authService.isLogin();
    this.data = this.storageService.getData('userData');
    this.branchModel = this.data.branchModel ? this.data.branchModel : '';
    this.branchDetails();
    this.lineDetails();
  }

  branchDetails() {
    // branch details
    let params = {
      path: 'material_size/getbranchlist',
    };

    this.dataService.branchService(params).then((res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.branchList = res['branchdetails'];
      }
    });
  }

  //line details
  lineDetails() {
    // line details
    let params = {
      path: 'apppanelcheck/controllers/getlinelist.php',
    };

    this.dataService.postService(params).then((res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.lineList = res['linelist'];
        if (this.lineList) {
          this.setLine();
        }
      }
    });
  }

  navigateTo(appName: string, app_type: string) {
    if (this.data.branchcode == 0) {
      let alert = {
        msg: 'Please select a branch',
      };
      this.reusableService.showAlert(alert);
    } else if (!this.lineModel) {
      let alert = {
        msg: 'Please select a Line',
      };
      this.reusableService.showAlert(alert);
    } else {
      this.storageService.setData('app_type', app_type);
      this.dataService.app_typeService().then((res: any) => {
        let uinno = res['uinno'];

        let userData = this.storageService.getData('userData') || {};

        userData.uinno = uinno;
        this.storageService.setData('userData', userData);
      });
      setTimeout(() => {
        this.navCtrl.navigateRoot([`${appName}`]);
        this.reusableService.cancelLoading();
      }, 100);
    }
  }

  setBranch() {
    let userData = this.storageService.getData('userData');
    if (userData) {
      userData.branchcode = this.branchModel.location_seq_num;
      userData.divcode = this.branchModel.location_seq_num;
      userData.branchModel = this.branchModel;
      this.data = userData;
    }
    this.storageService.setData('userData', userData);
  }

  setLine() {
    if (this.lineList.length == 1) {
      this.lineModel = this.lineList[0];
    }
    this.storageService.setData('line', this.lineModel);

    let toast = {
      message: `${this.lineModel['line_name']} has been set`,
      color: 'success',
      position: 'top',
    };

    this.reusableService.showToast(toast);
  }

  showDeviceType() {
    confirm(this.deviceType);
  }
}
