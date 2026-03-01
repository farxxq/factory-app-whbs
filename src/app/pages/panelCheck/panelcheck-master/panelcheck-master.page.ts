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
  styleUrls: ['./panelcheck-master.page.scss', '../../polypack/polypack-master/polypack-master.page.scss'],
  standalone: false
})
export class PanelcheckMasterPage implements OnInit {

  isScanner: boolean = false;

  panelBarcode: any = null;
  barcodeData: any = '';
  sizeBarcode: any = '';

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
  getScannedData(barcode: string) {
    let params = {
      path: 'carton_packing/order_barcode_num_details',
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

  onLaySlipInput(event: any, index?: any) {
    const value = event.detail.value.trim();
    console.log('laySlipInput is triggered', value);
    if (value) this.laySlipInputSubject.next(value);
  }

  lInpF: boolean = false;
  private laySlipInputSubject = new Subject<any>();
  @ViewChild('laySlipInput', { static: false }) laySlipInput!: IonInput;
  private inputSub: any

  setFocus() {
    this.laySlipInput.setFocus();
    this.lInpF = true;
    console.log('carton box focused');
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
  }

  addPcsPage() {
    let data = {
      season: this.seasonModel,
      customer: this.customerModel,
      order: this.orderModel,
      poNum: this.poModel,
      color: this.colorModel,
      sizeBarcode: this.sizeBarcode,
      // this will be given in the service and we will directly apply it from their
      lay_slip: "PCL25261401",
      bundle: 10
    };
    this.pcService.sendListData(data);
    this.navCtrl.navigateForward('panelcheck/panelcheckaddpcs');
  }


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

}
