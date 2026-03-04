import { Component, OnInit, ViewChild } from '@angular/core';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { DataService } from '../../../providers/dataService/data-service';
import { debounceTime, Subject } from 'rxjs';
import { IonInput, NavController } from '@ionic/angular';
import { Spanelcheck } from '../panelcheckService/spanelcheck';

@Component({
  selector: 'app-panelcheck-master',
  templateUrl: './panelcheck-master.page.html',
  styleUrls: ['./panelcheck-master.page.scss'],
  standalone: false
})
export class PanelcheckMasterPage implements OnInit {

  isScanner: boolean = false;

  panelBarcode: any = null;
  replaceBarcode: any = null;
  barcodeData: any = '';

  seasonList: any = [];
  customerList: any = [];
  orderList: any = [];
  poList: any = [];
  colorList: any = [];
  laySlipList: any = []; //layslip will be considered

  seasonModel: any = '';
  customerModel: any = '';
  orderModel: any = '';
  poModel: any = '';
  colorModel: any = '';
  laySlipModel: any = ''; //layslip will be considered
  quantityModel: string | number = '';

  isReplaceScanned: boolean = false;

  lInpF: boolean = false;
  private laySlipInputSubject = new Subject<any>();
  @ViewChild('laySlipInput', { static: false }) laySlipInput!: IonInput;
  private inputSub: any;
  private replaceInputSub: any;

  rInpF: boolean = false;
  private replaceInputSubject = new Subject<any>();
  @ViewChild('replaceInput', { static: false }) replaceInput !: IonInput;

  constructor(
    private storageService: StorageService,
    private reusableService: ReusableService,
    private dataService: DataService,
    private pcService: Spanelcheck,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    let alert = {
      msg: "External Scanner connected?",
      btn: [
        {
          text: 'NO',
          role: 'confirm',
          func: () => {
            this.storageService.setData('isScanner', false);
            let toast = {
              message: '📝 Manual Entry type is enabled',
              position: 'bottom',
              color: 'medium'
            }

            this.reusableService.showToast(toast);
            this.isScanner = this.storageService.getData('isScanner');
          }
        },
        {
          text: 'YES',
          role: 'confirm',
          func: () => {
            this.storageService.setData('isScanner', true);
            let toast = {
              message: '[ ] External Scanner type is enabled',
              position: 'bottom',
              color: 'medium'
            }

            this.reusableService.showToast(toast);
            this.isScanner = this.storageService.getData('isScanner');
          }
        }
      ]
    }

    this.reusableService.showAlert(alert);
  }

  ngAfterContentInit(): void {
    this.assignListService(0);

    let deviceType = this.storageService.getData('deviceType');

    this.isScanner = this.storageService.getData('isScanner');
    console.log(this.isScanner)
  }

  rawListArr = [
    'seasonList_seasonModel',
    'customerList_customerModel',
    'orderList_orderModel',
    'colorList_colorModel',
    'laySlipList_laySlipModel',
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
        path: 'carton_packing/getseasonlist',
      };
      arrlist = 'seasonList';
      reslist = 'seasonlist';
      key = 'season_name';
    } else if (frm == 1) {
      params = {
        path: 'carton_packing/getcustomerlist',
        seasonseqnum: this.seasonModel['season_seq_num'],
      };
      arrlist = 'customerList';
      reslist = 'customerlist';
      key = 'customer_short_name';
    } else if (frm == 2) {
      params = {
        path: 'carton_packing/getordername',
        customerseqnum: this.customerModel['customer_seq_num'],
        seasonseqnum: this.seasonModel['season_seq_num']
      };
      arrlist = 'orderList';
      reslist = 'ordernamelist';
      key = 'order_name';
    } else if (frm == 3) {
      params = {
        path: 'carton_packing/getcolors',
        orderseqnum: this.orderModel['order_seq_num'],
      };
      arrlist = 'colorList';
      reslist = 'colordetails';
      key = 'color_name';
    }
    // else if (frm == 5) {
    //   params = {
    //     path: 'carton_packing/getlaySlip',
    //     orderseqnum: this.orderModel['order_seq_num'],
    //     colorseqnum: this.colorModel['color_seq_num'],
    //   };
    //   arrlist = 'laySlipList';
    //   reslist = 'laySlipdetails';
    //   key = 'laySlip_name';
    // }

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        if (res[reslist].length > 0) {
          this[arrlist] = this.reusableService.rearrangeData(res[reslist], key);
          console.log('rearrangeSeasonList', this[arrlist])
        } else {
          let data = arrlist.split('L')[0].toUpperCase();
          let alert = {
            msg: `⚠️ No ${data}'s`
          }

          this.reusableService.showAlert(alert);
        }
        if (params?.['path'] == 'carton_packing/__some other link___') {

        }
      } else if (res['status'].toLowerCase() == 'error') {
        if (params?.['path'] == 'carton_packing/getponumlist') {
          if (this.poList.length == 0) {
            let alert = {
              msg: res['message'],
            };

            this.reusableService.showAlert(alert);
          }

        }
      }
    });
  }

  //Scan functions
  // LaySlip scan
  getScannedData(barcode: string) {
    let params = {
      path: 'carton_packing/order_barcode_num_details', //service for laycut yet to be provided
      order_barcode_num: barcode.trim()
    }

    this.dataService.postService(params).then((res: any) => {
      if (res['status'] == 'error') {
        let alert = {
          msg: res['message']
        }

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
      this.colorList = res['colordetails'];
      this.colorModel = res['colordetails'][0];
      this.addPcsPage(); //on scan we will directly go to the next page as per request

      // } 


    })

    //temp
    // this.panelBarcode = barcode;
    // console.log(this.panelBarcode);

  }

  // Replace scan
  goToReplacement(barcode: string) {

    let params = {
      path: 'carton_packing/order_barcode_num_details', //service for Replacement yet to be provided
      order_barcode_num: barcode.trim()
    }

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
            }
          }
        }

        this.reusableService.showAlert(alert);
        return;
      }
      // if (res['status'].toLowerCase() == 'success') {

      this.replaceBarcode = barcode;
      this.isReplaceScanned = true;
      // PDK-3824
      this.replacePcsPage(); //on scan we will directly go to the next page as per request
      // } 
    })

    //temp
    // this.panelBarcode = barcode;
    // console.log(this.panelBarcode);

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
          this.getScannedData(this.barcodeData)//function to take it to next page(more like getting the data here);

        }

        setTimeout(() => {
          this.barcodeData = '';
        }, 300);
      });

    this.replaceInputSub = this.replaceInputSubject.pipe(debounceTime(500)).subscribe((val: any) => {
      this.barcodeData = val;
      if (this.barcodeData) this.goToReplacement(this.barcodeData);


      setTimeout(() => {
        this.barcodeData = '';
      }, 300);
    })
  }

  // Navigate Pages
  addPcsPage() {
    let data = {
      season: this.seasonModel,
      customer: this.customerModel,
      order: this.orderModel,
      poNum: this.poModel,
      color: this.colorModel,
      sizeBarcode: 'S',
      // this will be given in the service and we will directly apply it from their
      lay_slip: "PCL25261401",
      bundle: 10
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
      poNum: this.poModel,
      color: this.colorModel,
      sizeBarcode: 'S',
      // this will be given in the service and we will directly apply it from here to that page
      lay_slip: "PCL25261401",
      size: 'S',
      panel_name: 'Collar',
      reason: "Stiching issue"
    };
    this.pcService.sendListData(data);
    this.navCtrl.navigateForward('panelcheck/panelcheckreplacepcs');

    //flags
    this.rInpF = false;
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
            message: this.isScanner ? '📷 Scanner type is enabled' : '📝 Manual entry is enabled',
            position: 'bottom',
            color: 'medium'
          }

          this.reusableService.showToast(toast);
          this.clearbelowAttrbutes(0);
          this.panelBarcode = null;
        },
      }
    ]

    return icons;
  }

  tabChange(event: any) {
    if (event?.tab == 'replace-panel') this.setFocus('replace')

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
    this.colorList = [];
    this.colorModel = '';
    this.poList = [];
    this.poModel = '';
  }

  ngOnDestroy() {
    if (this.inputSub) this.inputSub.unsubscribe();
    if (this.replaceInputSub) this.replaceInputSub.unsubscribe();
  }

}
