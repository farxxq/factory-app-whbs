import { Component, OnInit, ViewChild } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { IonInput, NavController } from '@ionic/angular';

// Services
import { Spanelcheck } from '../panelcheckService/spanelcheck';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { DataService } from '../../../providers/dataService/data-service';

@Component({
  selector: 'app-panelcheck-master',
  templateUrl: './panelcheck-master.page.html',
  styleUrls: ['./panelcheck-master.page.scss'],
  standalone: false,
})
export class PanelcheckMasterPage implements OnInit {
  //temp
  username: string = '';

  // scaning and barcode related
  isScanner: boolean = false;
  panelBarcode: any = null;
  replaceBarcode: any = null;
  barcodeData: any = '';
  isReplaceScanned: boolean = false;

  // dropdowns related
  seasonList: any = [];
  customerList: any = [];
  orderList: any = [];
  layColorList: any = [];
  laycutList: any = [];
  laySlipList: any = []; //layslip will be considered
  replaceList: any = [];

  seasonModel: any = '';
  customerModel: any = '';
  orderModel: any = '';
  layColorModel: any = '';
  laycutListModel: any = ''; //layslip will be considered
  quantityModel: string | number = '';

  // flags
  lInpF: boolean = false;

  // input subjects
  private laySlipInputSubject = new Subject<any>();
  @ViewChild('laySlipInput', { static: false }) laySlipInput!: IonInput;
  private inputSub: any;
  private replaceInputSub: any;

  rInpF: boolean = false;
  private replaceInputSubject = new Subject<any>();
  @ViewChild('replaceInput', { static: false }) replaceInput!: IonInput;

  constructor(
    private storageService: StorageService,
    private reusableService: ReusableService,
    private dataService: DataService,
    private pcService: Spanelcheck,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    let alert = {
      msg: 'External Scanner connected?',
      btn: [
        {
          text: 'NO',
          role: 'confirm',
          func: () => {
            this.storageService.setData('isScanner', false);
            let toast = {
              message: '📝 Manual Entry type is enabled',
              position: 'bottom',
              color: 'medium',
            };

            this.reusableService.showToast(toast);
            this.isScanner = this.storageService.getData('isScanner');
          },
        },
        {
          text: 'YES',
          role: 'confirm',
          func: () => {
            this.storageService.setData('isScanner', true);
            let toast = {
              message: '[ ] External Scanner type is enabled',
              position: 'bottom',
              color: 'medium',
            };

            this.reusableService.showToast(toast);
            this.isScanner = this.storageService.getData('isScanner');
          },
        },
      ],
    };

    this.reusableService.showAlert(alert);
    // operatorlogin
    let rfid = this.storageService.getData('rfid') || '';
    if (!rfid.operator) {
      this.reusableService.loginOperator();
      this.username = this.storageService.getData('userData')?.username;
    }
  }

  ngAfterContentInit(): void {
    this.assignListService(0);

    let deviceType = this.storageService.getData('deviceType');

    this.isScanner = this.storageService.getData('isScanner');
    console.log(this.isScanner);
  }

  rawListArr = [
    'seasonList_seasonModel',
    'customerList_customerModel',
    'orderList_orderModel',
    'layList_layListModel',
    'colorList_colorModel',
  ];
  onceCalled = 0;
  public clearbelowAttrbutes(frm) {
    // if (this.onceCalled == 0 || this.isScanner) {
    //   this.onceCalled = 1;
    //   return;
    // }
    for (let q = frm; q < this.rawListArr.length; q++) {
      let val: any = this.rawListArr[q].split('_');
      this[val[0]] = [];
      this[val[1]] = '';
    }

    this.assignListService(frm);
  }

  async assignListService(frm) {
    let params: {};
    let arrlist = '';
    let reslist = '';
    let key = '';

    // local apis
    if (frm == 0) {
      params = {
        path: 'apppolypack/controllers/getseasonlist.php',
      };
      arrlist = 'seasonList';
      reslist = 'seasonlist';
      key = 'season_name';
    } else if (frm == 1) {
      params = {
        path: 'apppolypack/controllers/getcustomerlist.php',
        seasonseqnum: this.seasonModel['season_seq_num'],
      };
      arrlist = 'customerList';
      reslist = 'customerlist';
      key = 'customer_short_name';
    } else if (frm == 2) {
      params = {
        path: 'apppolypack/controllers/getordername.php',
        customerseqnum: this.customerModel['customer_seq_num'],
        seasonseqnum: this.seasonModel['season_seq_num'],
        tabtype: 'M', // temp not needed, should rectify from the backend
      };
      arrlist = 'orderList';
      reslist = 'ordernamelist';
      key = 'order_name';
    } else if (frm == 3) {
      params = {
        path: 'apppanelcheck/controllers/getlaylist.php',
        customerseqnum: this.customerModel['customer_seq_num'],
        seasonseqnum: this.seasonModel['season_seq_num'],
        order_seq_num: this.orderModel['order_seq_num'],
        // orderseqnum: this.orderModel['order_seq_num'],
      };
      arrlist = 'laycutList';
      reslist = 'laylist';
      key = 'laycut_seq_num';
    } else if (frm == 4) {
      params = {
        path: 'apppanelcheck/controllers/getlaycolorlist.php',
        customerseqnum: this.customerModel['customer_seq_num'],
        seasonseqnum: this.seasonModel['season_seq_num'],
        orderseqnum: this.orderModel['order_seq_num'],
        laycut_seq_num: this.laycutListModel['laycut_seq_num'],
      };
      arrlist = 'layColorList';
      reslist = 'laycolorlist';
      key = 'color_name';
    } else if (frm == 5) {
      params = {
        path: 'apppanelcheck/controllers/getlaysizelist.php',
        customerseqnum: this.customerModel['customer_seq_num'],
        seasonseqnum: this.seasonModel['season_seq_num'],
        orderseqnum: this.orderModel['order_seq_num'],
        colorseqnum: this.layColorModel['color_seq_num'],
        laycut_seq_num: this.laycutListModel['laycut_seq_num'],
      };
      arrlist = 'laySlipList';
      reslist = 'laysizelist';
      key = 'laycut_seq_num';
    }

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        if (res[reslist].length > 0) {
          this[arrlist] = this.reusableService.rearrangeData(res[reslist], key);
          console.log('rearrangeList', this[arrlist]);
        } else {
          let data = arrlist.split('L')[0].toUpperCase(); //to get error msg from frontend
          let alert = {
            msg: `${res['message']}`,
          };

          this.reusableService.showAlert(alert);
        }

        // might be used
        if (params?.['path'] == 'carton_packing/__some other link___') {
        }
      } else if (res['status'].toLowerCase() == 'error') {
        if (params?.['path'] == 'carton_packing/getponumlist') {
          // if (this.poList.length == 0) {
          //   let alert = {
          //     msg: res['message'],
          //   };
          //   this.reusableService.showAlert(alert);
          // }
        }
      }
    });
  }

  //Scan functions
  // LaySlip scan
  getScannedData(barcode: string) {
    let params = {
      path: 'carton_packing/order_barcode_num_details', //service for laycut yet to be provided
      order_barcode_num: barcode.trim(),
    };

    this.dataService.postService(params).then((res: any) => {
      if (res['status'] == 'error') {
        let alert = {
          msg: res['message'],
        };

        this.reusableService.showAlert(alert);
      }
      // if (res['status'].toLowerCase() == 'success') {

      this.panelBarcode = barcode;
      // PDK-3824
      this.seasonModel = res['seasonlist'][0];
      this.customerList = res['customerlist'];
      this.customerModel = res['customerlist'][0];
      this.orderList = res['ordernamelist'];
      this.orderModel = res['ordernamelist'][0];
      this.layColorList = res['colordetails'];
      this.layColorModel = res['colordetails'][0];
      this.addPcsPage(); //on scan we will directly go to the next page as per request

      // }
    });

    //temp
    // this.panelBarcode = barcode;
    // console.log(this.panelBarcode);
  }

  // Replace scan
  goToReplacement(barcode: string) {
    let params = {
      path: 'carton_packing/order_barcode_num_details', //service for Replacement yet to be provided
      order_barcode_num: barcode.trim(),
    };

    this.dataService.postService(params).then((res: any) => {
      if (res['status'] == 'error') {
        let alert = {
          msg: res['message'],
          btn: {
            text: 'OK',
            role: 'confirm',
            func: () => {
              this.setFocus('replace');
              this.rInpF = false;
              this.isReplaceScanned = false;
            },
          },
        };

        this.reusableService.showAlert(alert);
        return;
      }
      // if (res['status'].toLowerCase() == 'success') {

      this.replaceBarcode = barcode;
      this.isReplaceScanned = true;
      // PDK-3824
      this.replacePcsPage(); //on scan we will directly go to the next page as per request
      // }

      this.seasonModel = res['seasonlist'][0];
      this.customerList = res['customerlist'];
      this.customerModel = res['customerlist'][0];
      this.orderList = res['ordernamelist'];
      this.orderModel = res['ordernamelist'][0];
      this.layColorList = res['colordetails'];
      this.layColorModel = res['colordetails'][0];
    });

    //temp
    // this.panelBarcode = barcode;
    // console.log(this.panelBarcode);
  }

  //temp button
  goToSupervisorHourlyEntry() {
    this.navCtrl.navigateForward('panelcheck-hourly-report');
  }

  // Data triggered using subject
  onLaySlipInput(event: any, index?: any) {
    const value = event.detail.value.trim();
    console.log('laySlipInput is triggered', value);
    if (value) this.laySlipInputSubject.next(value);
  }

  onReplaceInput(event: any, index?: any) {
    const value = event.detail.value.trim();
    console.log('laySlipInput is triggered', value);
    if (value) this.replaceInputSubject.next(value);
  }

  // Focus field
  setFocus(type?: string) {
    if (type == 'replace') {
      this.replaceInput.setFocus();
      this.rInpF = true;
      console.log('replace input focused');
      return;
    }
    this.laySlipInput.setFocus();
    this.lInpF = true;
    console.log('layslip input focused');
  }

  ngAfterViewInit(): void {
    this.inputSub = this.laySlipInputSubject
      .pipe(debounceTime(500))
      .subscribe((val: any) => {
        this.barcodeData = val;
        if (this.barcodeData) {
          this.getScannedData(this.barcodeData); //function to take it to next page(more like getting the data here);
        }

        setTimeout(() => {
          this.barcodeData = '';
        }, 300);
      });

    this.replaceInputSub = this.replaceInputSubject
      .pipe(debounceTime(500))
      .subscribe((val: any) => {
        this.barcodeData = val;
        if (this.barcodeData) this.goToReplacement(this.barcodeData);

        setTimeout(() => {
          this.barcodeData = '';
        }, 300);
      });
  }

  // Navigate Pages
  addPcsPage() {
    let data = {
      season: this.seasonModel,
      customer: this.customerModel,
      order: this.orderModel,
      color: this.layColorModel,
      lay_slip: this.laycutListModel['laycut_seq_num'],
      bundle: 10, //temp not needed
    };
    this.pcService.sendListData(data);
    this.navCtrl.navigateForward('panelcheck/panelcheckaddpcs');

    //flags
    this.lInpF = false;
  }

  replacePcsPage() {
    let data = {
      season: this.seasonModel,
      customer: this.customerModel,
      order: this.orderModel,
      color: this.layColorModel,
      // this will be given in the service and we will directly apply it from here to that page
      lay_slip: this.laycutListModel['laycut_seq_num'],
      reject_panel: [
        {
          panel_name: 'Collar',
          panel_name_seq_num: 1,
          reason: 'Sticting issue',
          reason_seq_num: 1,
        },
      ],
    };
    //flags
    this.rInpF = false;
    this.isReplaceScanned = false;
    this.pcService.sendListData(data);
    this.navCtrl.navigateForward('panelcheck/panelcheckreplacepcs');
  }

  // Header icons
  assignHeaderIcons() {
    let icons = [
      {
        iconName: this.isScanner ? 'scan' : 'text',
        func: () => {
          this.isScanner = !this.isScanner;
          this.storageService.setData('isScanner', this.isScanner); //unhygenic toggle here...
          let toast = {
            message: this.isScanner
              ? '📷 Scanner type is enabled'
              : '📝 Manual entry is enabled',
            position: 'bottom',
            color: 'medium',
          };

          this.reusableService.showToast(toast);
          this.clearbelowAttrbutes(0);
          this.panelBarcode = null;
        },
      },
    ];

    return icons;
  }

  tabChange(event: any) {
    if (event?.tab == 'replace-panel') this.setFocus('replace');

    // this.isScanner = this.storageService.getData('isScanner');
    this.barcodeData = '';
    this.replaceBarcode = '';
    this.isReplaceScanned = false;
    this.rInpF = false;
    this.lInpF = false;
    if (!this.isScanner) this.clearbelowAttrbutes(0);
    this.seasonModel = '';
    this.customerList = [];
    this.customerModel = '';
    this.orderList = [];
    this.orderModel = '';
    this.layColorList = [];
    this.layColorModel = '';
    this.laycutList = [];
    this.laycutListModel = '';
  }

  ngOnDestroy() {
    if (this.inputSub) this.inputSub.unsubscribe();
    if (this.replaceInputSub) this.replaceInputSub.unsubscribe();
  }
}
