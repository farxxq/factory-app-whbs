import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../providers/dataService/data-service';
import { AuthService } from '../../../providers/authService/auth-service';

import { IonInput, NavController } from '@ionic/angular';

import { debounceTime, Subject } from 'rxjs';

import { ReusableService } from '../../../providers/reusables/reusable-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { Scartonpacking } from '../services/scartonpacking';

@Component({
  selector: 'app-cartonpacking',
  templateUrl: './cartonpacking.page.html',
  styleUrls: ['./cartonpacking.page.scss'],
  standalone: false,
})
export class CartonpackingPage implements OnInit, AfterViewInit {
  deviceType!: string;

  cartonBarcodeData: any;

  cartonBarcodeDataArr: any = [];

  cartonBoxQrDetails: any = [];

  poList: any = [];

  boxVolume: any = ''; //thought of calculating the boxvolume here and sending it to the next page...this will be added soon

  @ViewChild('cartonBarcodeInput', { static: false })
  cartonBarcodeInput!: IonInput;


  private cartonInputSubject = new Subject<string>();
  private inputSub: any;

  //temp data
  cartonBoxQr: any = {
    cartonBoxQrDetails: [
      {
        season_shortname: 'SUMMER 21',
        customer: 'CWD',
        order_name: 'CWD-020',
        dimension_length: '10',
        dimension_width: '10',
        dimension_height: '10',
        dimension_weight: '10',
        qrcode_format: '2020-4770-SizeC-10-10-10-0001',
      },
    ],
    ponumberlist: [
      {
        order_ponumber: 3241783,
      },
      {
        order_ponumber: 3241784,
      },
    ],
    accomodateSizeQty: [
      {
        size_seq_num: 227,
        size_name: 'XXL',
        sizeQty: '78',
      },
      {
        size_seq_num: 228,
        size_name: 'XL',
        sizeQty: '98',
      },
    ],
  };

  constructor(
    public dataService: DataService,
    public authService: AuthService,
    private reusableService: ReusableService,
    private storageService: StorageService,
    private cartonService: Scartonpacking,
    private navCtrl: NavController
  ) {
    this.authService.isLogin();
  }

  ngOnInit() {
    this.deviceType = this.storageService.getData('deviceType');
  }

  ngAfterContentInit(): void {
    let deviceType = this.storageService.getData('deviceType');
    if (deviceType == 'mobile') {
      let alert = {
        msg: 'Tab/Desktop screen is preferable for this application',
        btn: [
          {
            text: 'OK',
            role: 'confirm',
            func: () => {
              this.navCtrl.navigateRoot('/home');
              console.log(
                `screen ${deviceType} isn\'t compatible so navigated back to home`
              );
            },
          },
        ],
      };
      this.reusableService.showAlert(alert);
    }
  }

  // Barcode scanner Funcs
  async startScan() {
    let api = this.cartonService.changeApi('cartonpacking_scan/getcartonpackinglist');
    let params = {
      path: api,
      // path: 'appcartonpack/controllers/getcartonpackinglist.php'
      cartonbox_qrcode:
        this.cartonBarcodeData.trim('') || this.copycartonBarcodeData,
    };

    // http post
    this.dataService.postService(params).then((res: any) => {
      if (res['status'].toLowerCase() == 'success') {

        this.cartonBarcodeDataArr = this.storageService.getData('cartonBox_scanned') || [];

        if (!this.cartonBarcodeDataArr.includes(this.cartonBarcodeData)) {
          this.cartonBarcodeDataArr.push(this.cartonBarcodeData)
        }

        this.storageService.setData('cartonBox_scanned', this.cartonBarcodeDataArr);

        this.poList = res['ponumberlist'];
        this.cartonBoxQrDetails = res['cartonpacklist'];
        let mapped_po = res['mapped_po']
        console.log('poList', this.poList);

        let cartonData = {
          mapped_po: mapped_po,
          cartonBoxQrDetails: this.cartonBoxQrDetails,
          poList: this.poList,
        };
        if (this.cartonBoxQrDetails[0].cartonpacking_status == 'DELETED') {
          let alert = {
            msg: `${this.cartonBoxQrDetails[0].qrcode_format} has been DELETED`,
            btn: {
              text: 'OK',
              role: 'confirm',
              func: () => {
                this.cartonInputSubject.next('');
                console.warn(`The Cartonpack : ${this.cartonBoxQrDetails[0].qrcode_format} has been DELETED`)
              }
            }
          }

          this.reusableService.showAlert(alert);
          return;
        }
        setTimeout(() => {
          this.navCtrl.navigateForward('cartonpacking/garmentscan');
          this.cartonService.sendCartonDetails(cartonData);
          this.cartonInputSubject.next('');
          this.cartonBarcodeData = '';
        }, 500);


        //flags
        this.cInpF = false;
      } else if (res['status'].toLowerCase() == 'error') {

        let alert = {
          msg: `Invalid Qr: ${this.cartonBarcodeData}`,
        };
        this.reusableService.showAlert(alert);
        this.reusableService.playAudio('warning');
        this.cartonInputSubject.next('');
        this.cartonBarcodeData = '';
      } else {
        let toast = {
          message: 'Please check your internet connection and try again',
          color: 'danger',
        };
        this.reusableService.showToast(toast);
        this.cartonInputSubject.next('');
        this.cartonBarcodeData = '';
      }
    });

    // temp
    // let cartonData = {
    //   cartonBoxQrDetails: this.cartonBoxQr.cartonBoxQrDetails,
    //   poList: this.cartonBoxQr.ponumberlist,
    // };
    // this.navCtrl.navigateForward('cartonpacking/garmentscan');
    // this.cartonService.sendCartonDetails(cartonData);
    // let toast = {
    //   message: 'Temp data being sent',
    //   color: 'dark',
    // };

    // this.reusableService.showToast(toast);
    console.log('cartonBox scan clicked');
    console.log('cartonBoxQrDetails', this.cartonBoxQrDetails);
  }


  //Barcode input box related
  cInpF: boolean = false;
  setFocus(input: string) {
    this.cartonBarcodeInput.setFocus();
    this.cInpF = true;
    console.log('carton box focused');
  }

  copycartonBarcodeData: any = '';
  ngAfterViewInit(): void {
    this.inputSub = this.cartonInputSubject
      .pipe(debounceTime(500))
      .subscribe((val: any) => {
        this.cartonBarcodeData = val;
        if (this.cartonBarcodeData) this.startScan();

        setTimeout(() => {
          this.copycartonBarcodeData = this.cartonBarcodeData;
          this.cartonBarcodeData = '';
        }, 10000);
      });
  }

  onCartonInput(event: any, isBut?) {
    const value = isBut ? this.cartonBarcodeData : event.detail.value;
    console.log('cartonInput is triggered', value);
    // if(value) this.cartonInputSubject.next(value); //need to check this
    this.cartonInputSubject.next(value);
  }

  ngOnDestroy() {
    if (this.inputSub) {
      this.inputSub.unsubscribe();
    }
  }

  assignHeaderIcons() {
    let icons = [{
      iconName: 'file-tray-full',
      navTo: '/cartonpacking/cartonpack-details'
    }]

    return icons
  }
}
