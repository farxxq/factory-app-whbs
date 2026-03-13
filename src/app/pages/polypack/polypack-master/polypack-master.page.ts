import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController, NavController } from '@ionic/angular';
import { AuthService } from '../../../providers/authService/auth-service';
import { DataService } from '../../../providers/dataService/data-service';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { Spolypack } from '../service/spolypack';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-polypack-master',
  templateUrl: './polypack-master.page.html',
  styleUrls: ['./polypack-master.page.scss'],
  standalone: false,
})
export class PolypackMasterPage implements OnInit {
  deviceType: string = '';

  rfid: any = {};

  //flags
  poF: boolean = false;

  barcodeData: any = '';
  sizeBarcode: any = null;

  polyPackRawList: any = [];
  polyPackUpdateList: any = [];
  quantityList: any = [];

  seasonList: any = [];
  customerList: any = [];
  lineList: any = []; //new addition
  orderList: any = [];
  poList: any = [];
  colorList: any = [];
  sizeList: any = [];
  poFullList: any = [];

  seasonModel: any = '';
  customerModel: any = '';
  lineModel: any = ''; //new addition
  orderModel: any = '';
  poModel: any = '';
  colorModel: any = '';
  sizeModel: any = '';
  quantityModel: string | number = '';

  actionType: string = '';
  isScanner: boolean = false;

  constructor(
    public dataService: DataService,
    public authService: AuthService,
    private reusableService: ReusableService,
    private storageService: StorageService,
    private polypackService: Spolypack,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
  ) {
    this.authService.isLogin();
  }

  ngOnInit() {
    this.deviceType = this.storageService.getData('deviceType');
    // Scanner type
    let alert = {
      msg: 'External Scanner connected?',
      btn: [
        {
          text: 'NO',
          role: 'confirm',
          func: () => {
            this.storageService.setData('isScanner', false);
            let toast = {
              message: '📷 Camera type is enabled',
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
              message: '[ ] Scanner type is enabled',
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
    this.checkOperator();
  }

  ngAfterContentInit(): void {
    let deviceType = this.storageService.getData('deviceType');

    this.isScanner = this.storageService.getData('isScanner');
    console.log(this.isScanner);
  }

  checkOperator() {
    this.rfid = this.storageService.getData('rfid') || {};

    if (!this.rfid.operator) {
      this.reusableService.loginOperator();

      const interval = setInterval(() => {
        this.rfid = this.storageService.getData('rfid');

        if (this.rfid?.operator) {
          clearInterval(interval);
          this.assignListService(0);
        }
      }, 500);
    } else {
      this.assignListService(0);
    }
  }

  rawListArr = [
    'seasonList_seasonModel',
    'customerList_customerModel',
    'lineList_lineModel', //new addition
    'orderList_orderModel',
    'poList_poModel',
    'colorList_colorModel',
    'sizeList_sizeModel',
  ];
  onceCalled = 0;
  public clearbelowAttrbutes(frm) {
    if (this.onceCalled == 0 || this.sizeBarcode) {
      this.onceCalled = 1;
      return;
    }
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
      let api = this.polypackService.changeApiPolypack(
        'carton_packing/getseasonlist',
      );
      params = {
        path: api,
      };
      arrlist = 'seasonList';
      reslist = 'seasonlist';
      key = 'season_name';
    } else if (frm == 1) {
      let api = this.polypackService.changeApiPolypack(
        'carton_packing/getcustomerlist',
      );

      params = {
        // path: 'apppanelcheck/controllers/getlinelist.php',
        path: api,
        seasonseqnum: this.seasonModel['season_seq_num'],
      };
      arrlist = 'customerList';
      reslist = 'customerlist';
      key = 'customer_short_name';
    } else if (frm == 2) {
      params = {
        path: 'apppanelcheck/controllers/getlinelist.php',
        seasonseqnum: this.seasonModel['season_seq_num'],
        customerseqnum: this.customerModel['customer_seq_num'],
      };
      arrlist = 'lineList';
      reslist = 'linelist';
      key = 'line_name';
    } else if (frm == 3) {
      let api = this.polypackService.changeApiPolypack(
        'carton_packing/getordername',
      );

      params = {
        path: api,
        customerseqnum: this.customerModel['customer_seq_num'],
        seasonseqnum: this.seasonModel['season_seq_num'],
        line_seq_num: this.lineModel['line_seq_num']
          ? this.lineModel['line_seq_num']
          : '',
        tabtype: this.actionType !== '' ? this.actionType : null,
      };
      arrlist = 'orderList';
      reslist = 'ordernamelist';
      key = 'order_name';
    } else if (frm == 4) {
      let api = this.polypackService.changeApiPolypack(
        'carton_packing/getponumlist',
      );

      params = {
        path: api,
        customerseqnum: this.customerModel['customer_seq_num'],
        seasonseqnum: this.seasonModel['season_seq_num'],
        orderseqnum: this.orderModel['order_seq_num'],
        tabtype: this.actionType !== '' ? this.actionType : null,
      };
      arrlist = 'poList';
      reslist = 'ponumberlist';
      key = 'order_ponumber';
    } else if (frm == 5) {
      let api = this.polypackService.changeApiPolypack(
        'carton_packing/getcolors',
      );
      params = {
        path: api,
        // path: 'apppolypack/controllers/getcolors.php',
        orderseqnum: this.orderModel['order_seq_num'],
        orderponum: this.poModel['order_ponumber']
          ? this.poModel['order_ponumber']
          : null,
      };
      arrlist = 'colorList';
      reslist = 'colordetails';
      key = 'color_name';
    }
    // else if (frm == 5) {
    //   params = {
    //     path: 'carton_packing/getsize',
    //     path: 'apppolypack/controllers/getsize.php',
    //     orderseqnum: this.orderModel['order_seq_num'],
    //     colorseqnum: this.colorModel['color_seq_num'],
    //   };
    //   arrlist = 'sizeList';
    //   reslist = 'sizedetails';
    //   key = 'size_name';
    // }

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        if (res[reslist].length > 0) {
          this[arrlist] = this.reusableService.rearrangeData(res[reslist], key);
          console.log('rearrangeSeasonList', this[arrlist]);
        } else {
          let data = arrlist.split('L')[0].toLocaleUpperCase();
          let alert = {
            msg: `⚠️ No ${data}'s`,
          };

          this.reusableService.showAlert(alert);
        }
        if (
          params?.['path'] == 'carton_packing/getponumlist' ||
          params?.['path'] == 'apppolypack/controllers/getponumlist.php'
        ) {
          // if (params?.['path'] == 'apppolypack/controllers/getponumlist.php') {
          if (this.poList.length > 0) {
            this.poF = true;
            // let poItems = [];
            // let otherItems = res['others'];

            // for (const item of this.poList) {
            //   item['group'] = 'order_ponumber';
            //   poItems.push(item);
            // }

            //temp for the suboptions in the pselect(this might not be needed)
            // for (const item of otherItems) {
            //   item['group'] = 'others'
            // }

            // this.poFullList = [
            //   {
            //     label: 'ponumlist',
            //     value: 'ponum',
            //     items: poItems,
            //   },
            //   {
            //     label: 'Others',
            //     value: 'others',
            //     // items: otherItems
            //   },
            // ];
            console.log(this.poList, 'poList');
          }
        }
      } else if (res['status'].toLowerCase() == 'error') {
        if (
          params?.['path'] == 'carton_packing/getponumlist' ||
          params?.['path'] == 'apppolypack/controllers/getponumlist.php'
        ) {
          // if (params?.['path'] == 'apppolypack/controllers/getponumlist.php') {
          if (this.poList.length == 0) {
            let alert = {
              msg: res['message'],
              btn: [
                {
                  text: 'OK',
                  role: 'confirm',
                  func: () => {
                    // this.assignListService(4)
                    console.log("choose from color as no PO's");
                  },
                },
              ],
            };

            this.reusableService.showAlert(alert);
          }
        }
      }
    });
  }

  //other's wala (*-_-*)// NOT IN USE FROM THE BEGINNING
  poListFunc(list: any) {
    if (list['group'] == 'others') {
      this.poF = false;
      this.clearbelowAttrbutes(4);
      return;
    }
    this.poF = true;
    this.clearbelowAttrbutes(4);
  }

  tabChange(event: Event) {
    this.isScanner = this.storageService.getData('isScanner');
    if (!this.isScanner) this.clearbelowAttrbutes(0);
    this.seasonModel = '';
    this.customerList = [];
    this.customerModel = '';
    this.lineList = [];
    this.lineModel = '';
    this.orderList = [];
    this.orderModel = '';
    this.colorList = [];
    this.colorModel = '';
    this.poList = [];
    this.poModel = '';
    this.actionType = '';
  }

  async segmentChanged(event: Event) {
    this.clearbelowAttrbutes(0);
    this.seasonModel = '';
    this.customerModel = '';
    await this.reusableService.cancelLoading();
  }

  async barcodeAction(action: string) {
    if (action == 'map') {
      let alert = {
        header: '⚠️ Confirm Action',
        msg: 'Would you like to map the barcode?',
        btn: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Confirm',
            role: 'confirm',
            func: () => {
              this.mappingPage('map');
            },
          },
        ],
      };
      await this.reusableService.showAlert(alert);
    } else if (action == 'generate') {
      let alert = {
        header: '⚠️ Confirm Action',
        msg: 'Would you like to generate custom barcode',
        btn: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Confirm',
            role: 'confirm',
            func: () => {
              this.mappingPage('gen');
              console.log('Generate function here...');
            },
          },
        ],
      };
      this.orderModel.barcode_type == 'G'
        ? this.mappingPage('gen')
        : await this.reusableService.showAlert(alert);
      console.log('This will do the generate thing...');
    }
  }

  mappingPage(actionType: string) {
    let data = {
      season: this.seasonModel,
      customer: this.customerModel,
      line: this.lineModel,
      order: this.orderModel,
      poNum: this.poModel,
      color: this.colorModel,
      actionType: actionType,
    };
    this.polypackService.sendMapData(data);
    this.navCtrl.navigateForward('polypack/map-polypack');
  }

  addQuantityPage(type: string) {
    let data = {
      season: this.seasonModel,
      customer: this.customerModel,
      line: this.lineModel,
      order: this.orderModel,
      poNum: this.poModel,
      color: this.colorModel,
      sizeBarcode: this.sizeBarcode,
      type: type,
    };
    this.polypackService.sendAddData(data);
    this.navCtrl.navigateForward('polypack/add-polypack');
  }

  poMapQuantityPage() {
    let data = {
      season: this.seasonModel,
      customer: this.customerModel,
      line: this.lineModel,
      order: this.orderModel,
      poList: this.poList,
      color: this.colorModel,
      type: 'edit',
    };
    this.polypackService.sendAddData(data);
    this.navCtrl.navigateForward('polypack/pomap-polypack');
  }

  listQuantityPage() {
    let data = {
      season: this.seasonModel,
      customer: this.customerModel,
      line: this.lineModel,
      order: this.orderModel,
      poNum: this.poModel,
    };
    this.polypackService.sendListData(data);
    this.navCtrl.navigateForward('/polypack/list-polypack');
  }

  assignMapPageHeaderIcons() {
    let icons = [
      {
        iconName: this.isScanner ? 'scan' : 'camera',
        func: () => {
          this.isScanner = !this.isScanner;
          this.storageService.setData('isScanner', this.isScanner);
          let toast = {
            message: this.isScanner
              ? '📷 Scanner mapping is enabled'
              : '📝 Camera mapping is enabled',
            position: 'bottom',
            color: 'medium',
          };

          this.reusableService.showToast(toast);
        },
      },
    ];

    return icons;
  }

  assignAddPolyPageHeaderIcons() {
    let icons = [
      {
        iconName: this.isScanner ? 'scan' : 'text',
        func: () => {
          this.isScanner = !this.isScanner;
          this.storageService.setData('isScanner', this.isScanner); //unhygenic toggle here...
          let toast = {
            message: this.isScanner
              ? '📷 Scanner type is enabled'
              : '📝 Manual entry type is enabled',
            position: 'bottom',
            color: 'medium',
          };

          this.reusableService.showToast(toast);
          this.clearbelowAttrbutes(0);
          this.sizeBarcode = null;
          console.log(!this.seasonList.length || this.sizeBarcode, 'res');
        },
      },
    ];

    return icons;
  }

  //scan funcs
  getScannedData(barcode: string) {
    let api = this.polypackService.changeApiPolypack(
      'carton_packing/order_barcode_num_details',
    );

    let params = {
      path: api,
      order_barcode_num: barcode.trim(),
    };

    this.dataService.postService(params).then((res: any) => {
      if (res['status'] == 'error') {
        let alert = {
          msg: res['message'],
        };

        this.reusableService.showAlert(alert);
        return;
      }
      // if (res['status'].toLowerCase() == 'success') {

      this.sizeBarcode = barcode;
      // PDK-3824
      this.seasonModel = res['seasonlist'][0];
      this.customerList = res['customerlist'];
      this.customerModel = res['customerlist'][0];
      this.lineList = res['linelist'];
      // this.lineModel = res['linelist'][0];
      this.orderList = res['ordernamelist'];
      this.orderModel = res['ordernamelist'][0];
      this.colorList = res['colordetails'];
      this.colorModel = res['colordetails'][0];
      if (res['ponumberlist'][0]['order_ponumber'] != null) {
        console.log(res['ponumberlist'][0]['order_ponumber'] != null);
        this.poList = res['ponumberlist'];
        this.poF = true;
      } else {
        this.poF = false;
        let toast = {
          message: "No PO's for the Scanned order?",
          color: 'danger',
        };

        this.reusableService.showToast(toast);
      }
      this.poModel = '';
      // }
    });

    //temp
    // this.sizeBarcode = barcode;
    // console.log(this.sizeBarcode);
  }

  onSizeInput(event: any, index?: any) {
    const value = event.detail.value.trim();
    console.log('sizeInput is triggered', value);
    if (value) this.sizeInputSubject.next(value);
  }

  sInpF: boolean = false;
  private sizeInputSubject = new Subject<any>();
  @ViewChild('sizeInput', { static: false }) sizeInput!: IonInput;
  private inputSub: any;
  setFocus() {
    this.sizeInput.setFocus();
    this.sInpF = true;
    console.log('carton box focused');
  }

  ngAfterViewInit(): void {
    this.inputSub = this.sizeInputSubject
      .pipe(debounceTime(500))
      .subscribe((val: any) => {
        this.barcodeData = val;
        if (this.barcodeData) this.getScannedData(this.barcodeData); //function to take it to next page(more like getting the data here);

        setTimeout(() => {
          this.barcodeData = '';
        }, 300);
      });
  }

  //just temp to test the scanning of barcode
  async scanCode() {
    let data = await this.dataService.scanCode();
    if (data) {
      alert('data' + data);
      this.barcodeData = data;
    } else {
      alert('data' + data);
    }
  }

  ngOnDestroy(): void {
    for (const item of this.rawListArr) {
      let val: any = item.split('_');
      this[val[1]] = '';
    }
  }
}
