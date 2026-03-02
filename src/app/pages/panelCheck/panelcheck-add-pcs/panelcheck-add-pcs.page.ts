import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { IonInput, IonRouterOutlet, NavController } from '@ionic/angular';

import { debounceTime, Subject, Subscription } from 'rxjs';
import { IonModal } from '@ionic/angular/common';
import { DataService } from '../../../providers/dataService/data-service';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { IonicGuards } from '../../../guards/ionic-guards';
import { Spanelcheck } from '../panelcheckService/spanelcheck';

@Component({
  selector: 'app-panelcheck-add-pcs',
  templateUrl: './panelcheck-add-pcs.page.html',
  styleUrls: [
    './panelcheck-add-pcs.page.scss',
    // '../../polypack/polypack-master/polypack-master.page.scss',
  ],
  standalone: false,
})
export class PanelcheckAddPcsPage implements OnInit, AfterViewInit {
  filterDataList: any = {
    season: { season_name: 'seasonModel' },
    customer: { customer_name: 'customerModel' },
    order: { order_name: 'orderModel' },
    poNum: { ponum: 'poModel' },
    color: { color_name: 'colorModel' },
    sizeBarcode: 'sizeBarcode',
    // this will be given in the service and we will directly apply it from their
    lay_slip: 'PCL25261401',
    bundle: 10,
  };

  isScanner: any = '';

  rawQtyList: any = [];
  fullSizeList: any = [];

  selectedPart: any = null;

  // reasonList: any = [];
  reasonModel: any = null;

  barcodeData: any = '';

  isQrScanned: boolean = false;

  // isSelected: boolean = false;

  // @ViewChild('modal', { static: false }) modal!: IonModal;

  private qrInputSubject = new Subject<any>();
  @ViewChild('qrInput', { static: false })
  qrInput!: IonInput;

  // @ViewChild('container', { static: false })
  // container!: ElementRef<HTMLDivElement>;

  private inputSub: any;

  //flags
  submittedF: boolean = false;
  scanQrF: boolean = false;
  genQrF: boolean = false;
  isModalOpen: boolean = false;
  editF: boolean = false;

  public unsavedChanges: boolean = false;

  //temp data
  laySlipData = {
    article_no: '00421',
    size: 'L',
    group: 3,
    pcs: 20,
    panel_range: 100,
    lay_slip: 'PCL25261401',
    panel_name: 'All Parts',
    color: 'JET BLACK',
    bundle: 10,
  };

  panelData = [
    {
      article_no: '00421',
      size: 'L',
      group: 3,
      pcs: 20,
      panel_range: 100,
      lay_slip: 'PCL25261401',
      panel_name: 'All Parts',
      color: 'JET BLACK',
      bundle: 10,
      progress: 30,
      pass_pcs: 0,
      curr_bundle: 0,
      curr_panel: 0,
    },
  ];

  rejectPanels = [
    {
      part: 'Front',
      rejected: 0,
      barcode: '123456789012',
      isSelected: false,
    },
    {
      part: 'Back',
      rejected: 0,
      barcode: '123456789013',
      isSelected: false,
    },
    {
      part: 'Sleeve',
      rejected: 1,
      barcode: '123456789014',
      isSelected: false,
    },
    {
      part: 'Pocket',
      rejected: 0,
      barcode: '123456789015',
      isSelected: false,
    },
    {
      part: 'Collar',
      rejected: 2,
      barcode: '123456789016',
      isSelected: false,
    },
    {
      part: 'Shoulder',
      rejected: 1,
      barcode: '123456789017',
      isSelected: false,
    },
    {
      part: 'Left side',
      rejected: 0,
      barcode: '123456789018',
      isSelected: false,
    },
    {
      part: 'Right side',
      rejected: 3,
      barcode: '123456789019',
      isSelected: false,
    },
    {
      part: 'Zip',
      rejected: 0,
      barcode: '123456789020',
      isSelected: false,
    },
    {
      part: 'Buttons',
      rejected: 2,
      barcode: '123456789021',
      isSelected: false,
    },
    {
      part: 'Zip',
      rejected: 0,
      barcode: '123456789020',
      isSelected: false,
    },
    {
      part: 'Buttons',
      rejected: 2,
      barcode: '123456789021',
      isSelected: false,
    },
    {
      part: 'Zip',
      rejected: 0,
      barcode: '123456789020',
      isSelected: false,
    },
    {
      part: 'Buttons',
      rejected: 2,
      barcode: '123456789021',
      isSelected: false,
    },
  ];

  reasonList: any = [
    {
      reason: 'Fabric Defect',
      reason_seq_num: 1,
    },
    {
      reason: 'Cutting Error',
      reason_seq_num: 2,
    },
    {
      reason: 'Pattern Mismatch',
      reason_seq_num: 3,
    },
  ];

  constructor(
    private dataService: DataService,
    private reusableService: ReusableService,
    private storageService: StorageService,
    private pcService: Spanelcheck,
    private navCtrl: NavController,
    private ionicGuards: IonicGuards,
    private ionRouterOutlet: IonRouterOutlet,
  ) { }

  // showLoading = async () => await this.reusableService.showLoading();
  // cancelLoading = async () => await this.reusableService.cancelLoading();

  ngOnInit() {
    if (this.pcService.getListData()) { //temp debugging
      this.filterDataList = this.pcService.getListData();
    }

    // this.filterDataList = this.pcService.getListData();
    this.isScanner = this.storageService.getData('isScanner');

    setTimeout(() => {
      this.addQuantityInitialData();
    }, 100);
  }

  ionViewDidEnter() {
    this.ionRouterOutlet.swipeGesture = false;
  }

  async addQuantityInitialData() {
    let selectedValue = this.filterDataList;

    if (!selectedValue) {
      //just for development
      console.error('No info sent or it is null');
      this.navCtrl.back();
      let toast = {
        message: "Don't navigate through url",
        color: 'danger',
      };

      await this.reusableService.showToast(toast);
      return;
    }

    //http post
    let params = {
      path: 'carton_packing/getordersizeqty', //laycutslips data: includes the contents panelData variable
      colorseqnum: this.filterDataList.color['color_seq_num'],
      orderseqnum: this.filterDataList.order['order_seq_num'],
      orderponum: this.filterDataList.lay_slip
        ? this.filterDataList.lay_slip
        : // ? this.filterDataList.lay_slip['lay_slip']
        null,
    };

    // this.dataService.postService(params).then(async (res: any) => {
    //   if (res['status'].toLowerCase() == 'success') {
    //     this.rawQtyList = res;

    //     // this.fullSizeList = this.reusableService.rearrangeData(res['sizedata'], 'size_name');
    //     // this.fullSizeList = this.rawQtyList['laySlip'];
    //     let totalnum = 0;
    //     for (const list of this.fullSizeList) {
    //       list['polypack_qty'] = null;

    //       let balance = list.total_order_size_qty - list.total_pcssize_poly_qty;
    //       list['polypack_balance'] = Math.max(0, balance);

    //       if (list['barcode'] && !this.sizeListBarcodeArr.includes(list['barcode'])) {
    //         this.sizeListBarcodeArr.push(list['barcode']);
    //       }

    //       // list['isEdit'] = false; //edit has been disabled for now
    //       this.totalInitialQty += +list['total_pcssize_poly_qty']
    //     }

    //     //to increment the scanned size from the polypack-home page
    //     if (this.isScanner) {
    //       setTimeout(() => {
    //         let barcode = this.filterDataList.sizeBarcode;
    //         this.startScan(barcode);
    //       }, 300)
    //     }

    //     console.log('fullSizeListInitial: ', this.fullSizeList);
    //     console.log('orderQtyList', this.rawQtyList);
    //   } else {
    //     let toast = {
    //       message: res['message'],
    //       color: 'warning',
    //     };
    //     this.reusableService.showToast(toast);
    //   }
    // });

    for (const item of this.panelData) {
      item['curr_bundle'] = 0;
      item['curr_pcs'] = 0;
      item['progress'] = item['progress'] / 100;
      console.log(item['progress']);
    }
  }

  // button action related function:
  btnAction(action: string) {
    if (action == 'bundle') {
      console.log('pass bundle action');
    } else if (action == 'reject') {
      this.rejectSubmit();
    } else if (action == 'submit') {
      console.log('Close Laycut action');
    }
  }

  rejectSubmit() {
    console.log('reject submit');
    this.openModal();
  }

  // scan input related functions
  clearInputs() {
    this.barcodeData = '';
    this.rejectPanels.forEach((p) => (p.isSelected = false));
    this.reasonModel = '';
    this.selectedPart = null;
    this.isQrScanned = false;
    console.log('clear and refocus function');
  }

  onRejectBarcodeInput(event: any, index?: any) {
    const value = event.detail.value;
    this.qrInputSubject.next(value);

    console.log('rejectBarcodeInput is triggered', value);
    // this.barcodeData = value;
    // if (value) {
    //   setTimeout(() => {
    //     this.isQrScanned = true;
    //   }, 1000);
    // }
  }

  // Interactive functions

  //modal Functions
  openModal(item?: any) {
    //flags
    this.isModalOpen = true;
    // this.editSizeItem = item;
  }

  closeModal() {
    this.isModalOpen = false;
    this.clearInputs();
  }

  //Submit functions
  async confirmSubmit() {
    let alert = {
      header: 'Confirm Submission',
      msg: 'Are you sure you want to close the laycut?',
      btn: [
        {
          text: 'Cancel',
          role: 'cancel',
          func: async () => {
            let toast = {
              message: 'Submission cancelled',
              color: 'light',
            };
            await this.reusableService.showToast(toast);
            console.log('Submission cancelled');
          },
        },
        {
          text: 'Confirm',
          role: 'confirm',
          func: () => {
            // this.onSubmit();
          },
        },
      ],
    };

    await this.reusableService.showAlert(alert);
  }

  isSubmitDisabled(): boolean {
    let quantity = [];
    for (const list of this.fullSizeList) {
      if (list.polypack_qty != null || '') {
        quantity.push(list.polypack_qty);
      }
    }

    console.log(quantity);

    if (quantity.length > 0) {
      return false;
    }
    return true;

    // return this.fullSizeList.some((item: any) => item.polypack_qty != null || '');
  }

  // Complete bundle function
  onCompleteBundle() {
    //incomplete
    //http post
    let params = {
      path: 'carton_packing/cartonpackinginsert',
      colorseqnum: this.filterDataList.color['color_seq_num'],
      customerseqnum: this.filterDataList.customer['customer_seq_num'],
      orderseqnum: this.filterDataList.order['order_seq_num'],
      seasonseqnum: this.filterDataList.season['season_seq_num'],
      order_ponumber: this.filterDataList.poNum['order_ponumber'],
      sizedata: JSON.stringify(this.fullSizeList),
    };

    console.log('fullSizeList', this.fullSizeList);

    this.dataService.postService(params).then((res: any) => {
      let message: string = '';
      let color: string = '';

      if (res['status'].toLowerCase() == 'success') {
        color = 'success';

        // this.navCtrl.back();
        // this.submittedF = true;
      } else {
      }
      message = res['message'];

      let toast = {
        message: message,
        color: color,
      };

      this.reusableService.showToast(toast);
    });
  }

  // Rejection related functions
  // should have the auto focus on the input after selecting the part
  selectPart(part: any, idx: number) {
    this.rejectPanels.forEach((p) => (p.isSelected = false));
    if (!this.selectedPart || this.selectedPart.idx !== idx) {
      this.isQrScanned = false;
      setTimeout(() => {
        this.setFocus();
      }, 500);
      this.barcodeData = '';

      part.isSelected = true;
      part.idx = idx;
      this.selectedPart = part;
    }
    this.setFocus();

  }

  setFocus() {
    setTimeout(() => {
      this.qrInput.setFocus();
    }, 500);
    console.log('Focussed on scanner')
  }

  confirmRejection() {
    console.log('Rejected:', {
      part: this.selectedPart,
      reason: this.reasonModel,
    });
    this.barcodeData = '';
    this.closeModal();
  }

  ngAfterViewInit(): void {
    this.inputSub = this.qrInputSubject
      .pipe(debounceTime(500))
      .subscribe((val: any) => {
        this.barcodeData = val;
        setTimeout(() => {
          if (this.barcodeData) this.isQrScanned = true;
        }, 500);
      });
  }

  canLeave() {
    console.log('fullsizeList from canLeave', this.fullSizeList);
    for (const list of this.fullSizeList) {
      if (
        (list['polypack_qty'] && list['polypack_qty'] !== '') ||
        list['isEdit']
      ) {
        this.unsavedChanges = true;
      }
    }

    this.ionicGuards.canLeave(this.unsavedChanges);
  }

  ngOnDestroy() {
    if (this.inputSub) {
      this.inputSub.unsubscribe();
    }
  }
}
