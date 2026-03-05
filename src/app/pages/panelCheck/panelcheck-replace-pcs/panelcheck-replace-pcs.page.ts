import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, IonRouterOutlet, NavController } from '@ionic/angular';

import { debounceTime, Subject, Subscription } from 'rxjs';
// import { IonModal } from '@ionic/angular/common';
import { DataService } from '../../../providers/dataService/data-service';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { IonicGuards } from '../../../guards/ionic-guards';
import { Spanelcheck } from '../panelcheckService/spanelcheck';

@Component({
  selector: 'app-panelcheck-replace-pcs',
  templateUrl: './panelcheck-replace-pcs.page.html',
  styleUrls: ['./panelcheck-replace-pcs.page.scss'],
  standalone: false
})
export class PanelcheckReplacePcsPage implements OnInit {
  filterDataList: any = ''

  isScanner: any = '';

  rawQtyList: any = [];
  fullSizeList: any = [];

  // reasonList: any = [];
  reasonModel: any = null;

  barcodeData: any = '';

  // @ViewChild('modal', { static: false }) modal!: IonModal;

  private qrInputSubject = new Subject<any>();
  @ViewChild('qrInput', { static: false })
  qrInput!: IonInput;

  private inputSub: any;

  //flags
  submittedF: boolean = false;
  isModalOpen: boolean = false;

  public unsavedChanges: boolean = false;

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

    this.filterDataList = this.pcService.getListData();
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
      path: 'apppolypack/controllers/getordersizeqty.php', //laycutslips data: includes the contents panelData variable
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
  }

  // scan input related functions
  onRejectBarcodeInput(event: any, index?: any) {
    const value = event.detail.value;
    this.qrInputSubject.next(value);

    console.log('rejectBarcodeInput is triggered', value);
  }

  // Interactive functions

  //modal Functions
  openModal(item?: any) {
    //flags
    this.isModalOpen = true;
    // this.editSizeItem = item;
  }

  cancelReplacement() {
    let toast = {
      message: 'Replacement cancelled',
      color: 'warning'
    }

    this.reusableService.showToast(toast);
    this.navCtrl.back();
  }

  setFocus() {
    setTimeout(() => {
      this.qrInput?.setFocus();
    }, 500);
    console.log('Focussed on scanner')
  }

  // Submit replacement
  confirmReplacement() {
    console.log('Rejected:', this.filterDataList.reject_panel[0]);
    this.barcodeData = '';

    let params = {
      path: 'apppolypack/controllers/cartonpackinginsert.php',
      colorseqnum: this.filterDataList.color['color_seq_num'],
      customerseqnum: this.filterDataList.customer['customer_seq_num'],
      orderseqnum: this.filterDataList.order['order_seq_num'],
      seasonseqnum: this.filterDataList.season['season_seq_num'],
      order_ponumber: this.filterDataList.poNum['order_ponumber'],
      rejectPanel: this.filterDataList.rejectPanel[0],
    };

    console.log('fullSizeList', this.filterDataList);

    // this.dataService.postService(params).then((res: any) => {
    //   let message: string = '';
    //   let color: string = '';

    //   if (res['status'].toLowerCase() == 'success') {
    //     color = 'success';
    //     this.navCtrl.back();
    //  this.submittedF = true;
    //   } else {
    //     color = 'danger';
    //  this.submittedF = true;
    //   }
    //   message = res['message'];

    //   let toast = {
    //     message: message,
    //     color: color,
    //   };

    //   this.reusableService.showToast(toast);
    // });
  }

  canLeave() {
    console.log('fullsizeList from canLeave', this.filterDataList.reject_panel[0]);
    if (!this.submittedF) {
      this.unsavedChanges = true;
    }
    this.ionicGuards.canLeave(this.unsavedChanges);
  }
}
