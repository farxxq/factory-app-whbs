import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
  IonInput,
  IonRouterOutlet,
  NavController,
  Platform,
} from '@ionic/angular';


import { DataService } from '../../../providers/dataService/data-service';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { Spolypack } from '../service/spolypack';

import { debounceTime, Subject, Subscription } from 'rxjs';
import { IonModal } from '@ionic/angular/common';
import { IonicGuards } from '../../../guards/ionic-guards';
import { StorageService } from 'src/app/providers/storage/storage-service';
@Component({
  selector: 'app-po-map-polypack',
  templateUrl: './po-map-polypack.page.html',
  styleUrls: [
    '../polypack-master/polypack-master.page.scss', './po-map-polypack.page.scss',
  ],

  standalone: false
})
export class PoMapPolypackPage implements OnInit {
  deviceType: string;

  // filtered list
  filterDataList: any;

  // raw static list
  rawQtyList: any;

  // sizes list
  fullSizeList: any;

  // Dropdowns
  poList: any = '';
  poModel: any = '';

  totalQty: any;

  conditionalInfo: string = 'Select a PO to assign qty';

  constructor(
    private dataService: DataService,
    private reusableService: ReusableService,
    private storageService: StorageService,
    private polypackService: Spolypack,
    private platform: Platform,
    private navCtrl: NavController,
    private ionicGuards: IonicGuards,
    private ionRouterOutlet: IonRouterOutlet
  ) {
  }

  ngOnInit() {
    this.filterDataList = this.polypackService.getAddData();
    this.deviceType = this.reusableService.deviceType();


    if (this.filterDataList) {
      this.poList = this.filterDataList.poList;
      this.orderwiseQtyFunc();
    }

    console.log(this.poList)

    // po dropdowns
    setTimeout(() => {
      //initial and raw list for comparision
      this.addQuantityInitialData();
    }, 1000);
  }

  async orderwiseQtyFunc() {
    let params = {
      path: 'carton_packing/getorderpomappingqty',
      customerseqnum: this.filterDataList.customer['customer_seq_num'],
      seasonseqnum: this.filterDataList.season['season_seq_num'],
      orderseqnum: this.filterDataList.order['order_seq_num'],
      colorseqnum: this.filterDataList.color['color_seq_num']
    };

    this.dataService.postService(params).then((res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.rawQtyList = res['data'];

        console.log(this.poList)
      }
    })
  }

  async addQuantityInitialData(action?: string) {

    //flags
    this.fullSizeList = '';
    this.orderwiseQtyFunc();

    let selectedValue = this.filterDataList;
    if (!selectedValue) {
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
      path: 'carton_packing/getordersizeqty',
      colorseqnum: this.filterDataList.color['color_seq_num'],
      orderseqnum: this.filterDataList.order['order_seq_num'],
      orderponum: this.poModel && !action ? this.poModel.order_ponumber : '',
    };

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        let rawList = [];
        for (const item of res['sizedata']) {
          let data = {
            size_name: item['size_name'],
            total_pcssize_poly_qty: item['total_pcssize_poly_qty']
          }
          rawList.push(data);
        }
        // this.rawQtyList = rawList;

        console.log(rawList, 'rawlist')

        // some random concept *** remove it probably
        // for (const item of this.rawQtyList.sizedata) {
        //   if(item.barcode != item.barcode){

        //   }
        // }

        // this.fullSizeList = JSON.parse(JSON.stringify(this.rawQtyList));
        if (!action && this.poModel) {
          this.fullSizeList = this.reusableService.rearrangeData(res['sizedata'], 'size_name');
        }
        let totalnum = 0;
        // for (const list of this.fullSizeList) {
        //   list['polypack_qty'] = null;

        //   // let balance = 
        //   // list.total_pcssize_elc_qty
        //   //   ? list.total_pcssize_elc_qty <= list.total_order_size_qty
        //   //     ? list.total_pcssize_elc_qty - list.total_pcssize_poly_qty
        //   //     : list.total_order_size_qty - list.total_pcssize_poly_qty
        //   //   : list.total_order_size_qty - list.total_pcssize_poly_qty;

        //   let balance = list.total_order_size_qty - list.total_pcssize_poly_qty;
        //   list['polypack_balance'] = Math.max(0, balance);

        //   // list.total_pcssize_elc_qty
        //   //   ? list.total_pcssize_elc_qty - list.total_pcssize_poly_qty
        //   //   : list.total_order_size_qty - list.total_pcssize_poly_qty;

        //   // this.totalInitialQty += +list['total_pcssize_poly_qty']
        // }

        // this.poNum = this.filterDataList.poNum['order_ponumber'] ? this.filterDataList.poNum['order_ponumber'] : '';

        //to increment the scanned size from the polypack-home page

        console.log('fullSizeListInitial: ', this.fullSizeList);
        console.log('orderQtyList', this.rawQtyList);
      } else {
        this.conditionalInfo = res['message'] + ', Choose a different PO'
        let toast = {
          message: res['message'],
          color: 'warning',
        };
        this.reusableService.showToast(toast);
      }
    });
  }

  // submit functions
  async confirmSubmit() {
    let alert = {
      header: 'Confirm Submission',
      msg: 'Are you sure you want to submit?',
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
            this.onSubmit();
          },
        },
      ],
    };

    await this.reusableService.showAlert(alert);
  }

  onSubmit() {
    //http post
    let params = {
      path: 'carton_packing/cartonpackingpomappingstore',
      colorseqnum: this.filterDataList.color['color_seq_num'],
      customerseqnum: this.filterDataList.customer['customer_seq_num'],
      orderseqnum: this.filterDataList.order['order_seq_num'],
      seasonseqnum: this.filterDataList.season['season_seq_num'],
      order_ponumber: this.poModel.order_ponumber,
      sizedata: JSON.stringify(this.fullSizeList),
    };

    console.log('fullSizeList', this.fullSizeList);

    this.dataService.postService(params).then((res: any) => {
      let message: string = '';
      let color: string = '';

      if (res['status'].toLowerCase() == 'success') {
        color = 'success';
        this.totalQty = 0;
        // this.submittedF = true;
        this.addQuantityInitialData('refresh');

        // emptying the data
        this.fullSizeList = '';
        this.poModel = '';
      } else {
        color = 'danger'; //on errors alone we show this...
      }
      message = res['message'];

      let toast = {
        message: message,
        color: color,
      };

      this.reusableService.showToast(toast);
    });
  }

  async validateQty(item: any) {
    const enteredQty = Number(item.polypack_qty);

    // Required validation
    if (!enteredQty || enteredQty <= 0) {
      item.polypack_qty = null;
      this.totalAddedQty();
      return;
    }

    // Find balance from raw list
    const sizeData = this.rawQtyList.find(
      (size: any) => size.size_seq_num == item.size_seq_num
    );

    const balanceQty = Number(sizeData?.balance_polypack_qty || 0);

    // No balance available
    if (balanceQty < 1) {
      await this.reusableService.showAlert({
        msg: `No Qty to be mapped in size ${item.size_name}`,
        btn: [{
          text: 'OK',
          role: 'confirm',
          func: () => {
            item.polypack_qty = null;
            this.totalAddedQty();
          }
        }]
      });
      return;
    }

    // Exceeds balance
    if (enteredQty > balanceQty) {
      await this.reusableService.showAlert({
        msg: `${enteredQty} exceeds available balance (${balanceQty})`,
        btn: [
          {
            text: 'Reset',
            role: 'cancel',
            func: () => {
              item.polypack_qty = null;
              this.totalAddedQty();
            }
          },
          {
            text: 'Proceed',
            role: 'confirm',
            func: () => {
              this.totalAddedQty();
            }
          }
        ]
      });
      return;
    }

    this.totalAddedQty();
  }

  totalAddedQty() {
    this.totalQty = this.fullSizeList.reduce((accumulator: any, item: any) => {
      const qty = Number(item.polypack_qty) || 0;
      return accumulator + qty;
    }, 0);
    console.log(this.totalQty);
  }

  onQtyInput(event: any, item: any) {
    let value = event.target.value;

    value = value.replace(/[^0-9]/g, '');

    if (value.length > 1 && value.startsWith('0')) {
      value = value.replace(/^0+/, '');
    }

    item.polypack_qty = value;

    this.totalAddedQty();
  }


  // check this
  canLeave() {
    console.log('fullsizeList from canLeave', this.fullSizeList);
    for (const list of this.fullSizeList) {
      if (
        (list['polypack_qty'] && list['polypack_qty'] !== '') ||
        list['isEdit']
      ) {
        // this.unsavedChanges = true;
      }
    }

    this.ionicGuards.canLeave(false);
  }

}
