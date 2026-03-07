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
      // this.orderwiseQtyFunc(); // not needed i guess as we will be having the info in addQuantityInital
    }

    console.log(this.poList)

    // po dropdowns
    setTimeout(() => {
      this.addQuantityInitialData();
    }, 1000);
  }

  async orderwiseQtyFunc() {
    let api = this.polypackService.changeApiPolypack('carton_packing/getorderpomappingqty');

    let params = {
      path: api,
      // path: 'apppolypack/controllers/getorderpomappingqty.php',
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

    let api = this.polypackService.changeApiPolypack('carton_packing/getordersizeqty');
    //http post
    let params = {
      path: api,
      // path: 'apppolypack/controllers/getordersizeqty.php',
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
        let map = 0;
        let order = 100;
        let balanced = 100;

        for (const list of this.fullSizeList) {
          list['polypack_qty'] = null;


          let balance = list.total_order_size_qty - list.total_pcssize_poly_qty;
          list['polypack_balance'] = Math.max(0, balance);

          // list.total_pcssize_elc_qty
          //   ? list.total_pcssize_elc_qty - list.total_pcssize_poly_qty
          //   : list.total_order_size_qty - list.total_pcssize_poly_qty;

          // this.totalInitialQty += +list['total_pcssize_poly_qty']

          //temp ones delete after the service is merged
          // if (map < order) map = map + 10;
          // if (balance > 0) balanced = balanced - 10;
          // list['mapped_polypack_qty'] = map;
          // list['order_polypack_qty'] = order;
          // list['balance_polypack_qty'] = balanced;

          //for attractive data
          const remaining = list.order_polypack_qty - list.mapped_polypack_qty;

          const percentage = list.order_polypack_qty
            ? (remaining / list.order_polypack_qty) * 100
            : 0;

          list['stockClass'] = '';
          list['progress'] = (list.mapped_polypack_qty / list.order_polypack_qty);
          if (percentage <= 0) list['stockClass'] = 'qty-no-stock';
          else if (percentage < 45) list['stockClass'] = 'qty-low-stock';
          else list['stockClass'] = 'qty-in-stock';
          console.log(remaining, percentage)
        }

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
    let api = this.polypackService.changeApiPolypack('carton_packing/cartonpackingpomappingstore');

    //http post
    let params = {
      path: api,
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

    const balanceQty = Number(item?.balance_polypack_qty || 0);
    // const balanceQty = Number(sizeData?.balance_polypack_qty || 0);

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
            text: 'OK',
            role: 'cancel',
            func: () => {
              item.polypack_qty = null;
              this.totalAddedQty();
            }
          },
          // {
          //   text: 'Reset',
          //   role: 'cancel',
          //   func: () => {
          //     item.polypack_qty = null;
          //     this.totalAddedQty();
          //   }
          // },
          // {
          //   text: 'Proceed',
          //   role: 'confirm',
          //   func: () => {
          //     this.totalAddedQty();
          //   }
          // }
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

  // calcStock(item: any, type?: string) {
  //   if (type == 'progress') {
  //     if (item.balance_polypack_qty) {
  //       let progress = (item.balance_polypack_qty) / 100;
  //       return progress;
  //     } else {
  //       return 0;
  //     }
  //   }

  //   const remaining = item.order_polypack_qty - item.mapped_polypack_qty;
  //   let noStock = (remaining / item.order_polypack_qty) * 100 <= 0;
  //   let inStock = (remaining / item.order_polypack_qty) * 100 > 45;
  //   let lowStock = (remaining / item.order_polypack_qty) * 100 < 45 && (remaining / item.order_polypack_qty) * 100 > 0

  //   console.log(noStock, inStock, lowStock)

  //   if (noStock) return 'qty-no-stock'
  //   if (inStock) return 'qty-in-stock'
  //   if (lowStock) return 'qty-low-stock'
  //   return null;
  // }

  clearQty() {
    this.fullSizeList.forEach(item => {
      item.polypack_qty = null;
    });
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
