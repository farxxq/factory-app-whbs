import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DataService } from '../../../providers/dataService/data-service';
import { Scartonpacking } from '../services/scartonpacking';
import { IonicGuards } from '../../../guards/ionic-guards';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/providers/authService/auth-service';

@Component({
  selector: 'app-cartonpack-details',
  templateUrl: './cartonpack-details.page.html',
  styleUrls: ['./cartonpack-details.page.scss'],
  standalone: false
})
export class CartonpackDetailsPage implements OnInit {
  deviceType: any = '';

  barcode: any = '';
  barcode_highlight: boolean = false;

  cartonPacksList: any = [];
  boxDetails: any = [];

  seasonList: any = [];
  customerList: any = [];
  orderList: any = [];
  poList: any = [];
  sizeList: any = [];

  seasonModel: any = '';
  customerModel: any = '';
  orderModel: any = '';
  poModel: any = '';

  expandAccordion: any = '';

  poF: boolean = false;

  isModalOpen: boolean = false;
  isSizesModalOpen: boolean = false;
  isapprovalsModalOpen: boolean = false;

  remarkList: any = [];
  remarkModel: any = '';

  cartonData: any = [];
  sizeRemarksList: any = [
    {
      "size": "10B",
      "size_seq_num": "112",
      "barcode_data": "",
      "current_carton_pcs": 0,
      "remarks": [
        {
          "removed_pcs": 1,
          "remarks": 'Remarks 1',
          "remarks_seq_num": 1,
          "timeStamp": '12-12-2020T10:30'
        },
        {
          "removed_pcs": 1,
          "remarks": 'Remarks 2',
          "remarks_seq_num": 2,
          "timeStamp": '12-12-2020T10:30'
        },
      ]
    },
    {
      "size": "16A",
      "size_seq_num": "115",
      "barcode_data": "",
      "current_carton_pcs": 0,
      "remarks": [
        {
          "removed_pcs": 1,
          "remarks": 'Remarks 2',
          "remarks_seq_num": 2,
          "timeStamp": '12-12-2020T10:30'
        },
        {
          "removed_pcs": 1,
          "remarks": 'Remarks 4',
          "remarks_seq_num": 4,
          "timeStamp": '12-12-2020T10:30'
        }
      ]
    }
  ];
  toResetCartonPackName: string = '';
  toCancelCartonPackName: string = '';

  // showLoading = async () => await this.reusableService.showLoading();
  // cancelLoading = async () => await this.reusableService.cancelLoading();


  constructor(
    private dataService: DataService,
    private reusableService: ReusableService,
    private navCtrl: NavController,
    private cartonService: Scartonpacking,
    private ionicGuards: IonicGuards,
    private storageService: StorageService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.assignListService(0);
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

  rawListArr = [
    'seasonList_seasonModel',
    'customerList_customerModel',
    'orderList_orderModel',
    'poList_poModel',
  ];

  onceCalled = 0;
  public clearbelowAttrbutes(frm) {
    if (this.onceCalled == 1) return;
    this.onceCalled = 1;
    this.poCartonsData = {};
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

    if (frm == 0) {
      let api = this.cartonService.changeApiPolypack('carton_packing/getseasonlist');
      params = {
        path: api,
      };
      arrlist = 'seasonList';
      reslist = 'seasonlist';
      key = 'season_name';
    } else if (frm == 1) {
      let api = this.cartonService.changeApiPolypack('carton_packing/getcustomerlist');

      params = {
        path: api,
        seasonseqnum: this.seasonModel['season_seq_num'],
      };
      arrlist = 'customerList';
      reslist = 'customerlist';
      key = 'customer_short_name';
    } else if (frm == 2) {
      let api = this.cartonService.changeApiPolypack('carton_packing/getordername');

      params = {
        path: api,
        customerseqnum: this.customerModel['customer_seq_num'],
        seasonseqnum: this.seasonModel['season_seq_num'],
      };
      arrlist = 'orderList';
      reslist = 'ordernamelist';
      key = 'order_name';
    } else if (frm == 3) {
      let api = this.cartonService.changeApiPolypack('carton_packing/getponumlist');

      params = {
        path: api,
        customerseqnum: this.customerModel['customer_seq_num'],
        seasonseqnum: this.seasonModel['season_seq_num'],
        orderseqnum: this.orderModel['order_seq_num'],
      };
      arrlist = 'poList';
      reslist = 'ponumberlist';
      key = 'order_ponumber'
    }

    this.dataService.postService(params).then(async (res: any) => {
      this.onceCalled = 0;
      if (res['status'].toLowerCase() == 'success') {
        this[arrlist] = this.reusableService.rearrangeData(res[reslist], key);
        console.log(`${key}`, this[arrlist])
        if (params?.['path'] == 'carton_packing/getponumlist' || params?.['path'] == 'apppolypack/controllers/getponumlist.php') {
          // this[arrlist] = this.reusableService.rearrangeData(res[reslist], key);

          if (res[reslist].length > 0) {
            this[arrlist] = this.reusableService.rearrangeData(res[reslist], key);
            console.log('rearrangePoList', this[arrlist])
          } else {
            let data = arrlist.split('L')[0].toUpperCase();
            let alert = {
              msg: `⚠️ No ${data}'s`
            }

            this.reusableService.showAlert(alert);
          }
          // this[ arrlist ] = JSON.parse(JSON.stringify(this.orderNumbers));
          if (this.poList.length > 0) {
            this.poF = true;
            this.poList.unshift({ "order_ponumber": "All" })
            this.poModel = { 'order_ponumber': 'All' }
            console.log(this.poList, 'poList', this.poModel, 'poModel');
          } else {
            this.poF = false;

            let alert = {
              msg: 'No PO\'s for this order',
            };

            this.reusableService.showAlert(alert);
          }
        }
      } else if (res['status'].toLowerCase() == 'error') {
        if (params?.['path'] == 'carton_packing/getponumlist' || params?.['path'] == 'apppolypack/controllers/getponumlist.php') {
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

  onAccordionChange(event: any) {
    if (event.detail.value.length > 1) {
      console.log('accordian opened', event.detail.value)
      let po = event.detail.value;
      this.viewCartonpacks(po[1]);
    } else {
      console.log('accordian closed', event.detail.value)
    }
  }

  //viewCarton packs
  poChosen: any = '';
  poCartonsData: any = {};
  noCartonPack: boolean = false;
  viewCartonpacks(po?: any) {
    console.log('poModel', this.poModel, 'po', po)
    if (!po && this.poModel.order_ponumber == 'All') {
      console.log('All selected, listing all the PO\'s');
      // return;
    } else if (po) {
      this.poChosen = { order_ponumber: po }
    };
    // if (this.poModel.order_ponumber == 'All' && !this.poChosen) {
    //   console.log('All selected, listing all the PO\'s');
    // }
    console.log('View button');

    //expanding of accordian
    let data = []
    for (const i of this.poList) {
      data.push(i.order_ponumber);
    }
    this.expandAccordion = data;
    this.expandAccordion = this.poModel.order_ponumber;
    let api = this.cartonService.changeApi('cartonpacking_scan/cartonpacked_details'); //changing api from local to live core.php


    let params = {
      path: api,
      orderseqnum: this.orderModel.order_seq_num,
      order_ponumber: this.poModel && this.poModel.order_ponumber !== 'All' ? this.poModel.order_ponumber : this.poChosen.order_ponumber
      //default params in the dataService itself
    };

    // http post
    this.dataService.postService(params).then(async (res: any) => {
      const poNumber = this.poModel && this.poModel.order_ponumber != 'All' ? this.poModel.order_ponumber : this.poChosen.order_ponumber;
      if (res['status'].toLowerCase() == 'success') {
        this.noCartonPack = false;
        this.cartonPacksList = res['cartonpacks_details'];

        // this.poCartonsData[poNumber] = this.cartonPacksList;
        this.poCartonsData[poNumber] = res['cartonpacks_details']['cartonpacks'];

        console.log('poCartonsData', this.poCartonsData)
        this.boxDetails = this.cartonPacksList['box_details'];
        console.log('cartonPacksList', this.cartonPacksList);
      } else if (res['status'].toLowerCase() == 'error') {
        this.poCartonsData[poNumber] = [{}];
        let condition = this.poModel && this.poModel.order_ponumber !== 'All' ? this.poModel.order_ponumber : this.poChosen.order_ponumber
        for (const po of this.poList) {
          if (condition == po.order_ponumber) {
            po['isEmpty'] = true;
          }
        }
        this.noCartonPack = true;
        let data = res['message']
        let toast = {
          message: data,
          color: 'danger'
        };
        console.log(toast);
        await this.reusableService.showToast(toast);
      } else {
        let toast = {
          message: 'Please check your internet connection and try again',
          color: 'danger',
        };
        await this.reusableService.showToast(toast);
      }
    });

    // will list the complete cartonDetails list here for one particular po ofcourse
    // this.cartonPacksList = this.cartonpacks;
    console.log('Cartonpacks details', this.cartonPacksList);
  }

  allSizeQtyList(qrcode: any) {
    for (const cartonItem of this.cartonPacksList['cartonpacks']) {
      for (const sizeItem of cartonItem['sizes']) {
        if (cartonItem.cartonpack_barcode == qrcode) {
          this.sizeList = sizeItem;
        }
      }
    }
  }

  // may be if they ask some more detailed view of sizes this can be helpful
  // allSizeQtyList(po: any, item: any) {
  //   console.log('sizes will be listed using this function');
  //   let params = {
  //     path: 'cartonpacking_scan/cartonPacksService',
  //     order_ponumber: po.order_ponumber, //po number wise filtering
  //     carton_seq_num: item.carton_seq_num //pack wise filter and size list
  //   };

  //   // http post
  //   // this.dataService.postService(params).then((res: any) => {
  //   //   if (res[ 'status' ].toLowerCase() == 'success') {
  //   //     // this.sizeList = res[ 'sizes' ];
  //   //     this.isSizesModalOpen = true;
  //   //     console.log('cartonPacksList', this.sizeList);
  //   //   } else if (res[ 'status' ].toLowerCase() == 'error') {
  //   //     let toast = {
  //   //       msg: res[ 'message' ],
  //   //     };
  //   //     this.reusableService.showToast(toast);
  //   //   } else {
  //   //     let toast = {
  //   //       message: 'Please check your internet connection and try again',
  //   //       color: 'danger',
  //   //     };
  //   //     this.reusableService.showToast(toast);
  //   //   }
  //   // });

  //   this.sizeList = item[ 'sizes' ]
  //   this.isSizesModalOpen = true;
  // }

  confirmAction(action: string, data?: any) {

    if (action != 'info') {
      let params = {
        path: 'cartonpacking_scan/getcartonpacking_remark_list',
        remark_type: action == 'reset' ? '3' : '4'
      };

      this.dataService.postService(params).then((res: any) => {
        if (res['status'].toLowerCase() == 'success') {
          this.remarkList = res['Remarklist'];
        }
      });
    }


    if (action == 'info') {
      // this.isSizesModalOpen = true; //remove_pcs approval not disucssed yet
      // this.isapprovalsModalOpen = true; // check
      this.cartonData = data;
      console.log(this.cartonData, 'info Action')

      let userRole = this.authService.userRole;
      let actionRequested = this.cartonData.request_type == 'RESET' ? 'RESET' : 'CANCEL'
      if (userRole == 'USER1' || 'USER2') {
        this.isapprovalsModalOpen = true;
        return;
      }

      let alert = {
        msg: `Yet to approve the ${actionRequested} process for the carton-pack ${this.cartonData.cartonpack_barcode}`,
        btn: [{
          text: 'OK',
          role: 'confirm',
          func: () => {
            console.log('User saw the approve status')
          }
        }]
      }

      this.reusableService.showAlert(alert);
    }
    if (action == 'reset') {
      this.cartonData = data;
      this.toResetCartonPackName = data.cartonpack_barcode;
      this.isModalOpen = true;
    } else if (action == 'cancel') {
      this.cartonData = data;
      this.toCancelCartonPackName = data.cartonpack_barcode;
      this.isModalOpen = true;
    }
  }

  cartonAction(action: string) {
    let data = [];
    //adding the cartonbox_qrcode_seq_num here...
    for (const size of this.cartonData['sizes']) {
      size['cartonbox_qrcode_seq_num'] = this.cartonData.cartonbox_qrcode_seq_num
    }

    console.log(action, 'action')

    // condition based params
    let path = (action == 'reset') ? 'cartonpacking_scan/save_scanned_sizes' : 'cartonpacking_scan/delete_cartonpacking_sizes'
    let api = this.cartonService.changeApi(path); //changing api from local to live core.php

    // let path = (action == 'reset') ? 'appcartonpack/controllers/save_scanned_sizes.php' : 'appcartonpack/controllers/delete_cartonpacking_sizes.php'

    let poNum = this.poModel && this.poModel.order_ponumber !== 'All' ? this.poModel.order_ponumber : this.poChosen.order_ponumber

    let requestType = this.toResetCartonPackName ? 'RESET' : 'DELETED';

    data.push(this.cartonData);

    let params = {
      path: api,
      cartonbox_qrcode_seq_num: this.cartonData.cartonbox_qrcode_seq_num,
      qrcode_format: this.cartonData.cartonpack_barcode,
      cartonbox_header_seq_num: this.cartonData.cartonbox_header_seq_num,
      ponumber: poNum,
      request_type: requestType,
      remarks_seq_num: this.remarkModel.remarks_seq_num,
      garmentpacking: JSON.stringify(data)
    }

    console.log(data, this.cartonData.sizes, params);

    this.dataService.postService(params).then((res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        let toast = {
          message: `📦 Carton box: ${this.cartonData.cartonpack_barcode} has been ${this.toResetCartonPackName ? 'RESET' : 'DELETED'}!`,
          color: 'success'
        }
        this.viewCartonpacks();
        this.reusableService.showToast(toast);

        //flag
        this.isModalOpen = false;
        this.remarkModel = '';
        this.toResetCartonPackName = '';
        this.toCancelCartonPackName = '';
      }
    })

    //temp
    // let toast = {
    //   message: `📦 Carton box: ${this.cartonData.cartonpack_barcode} has been ${this.toResetCartonPackName ? 'RESET' : 'DELETED'}!`,
    //   color: 'success'
    // }
    // this.reusableService.showToast(toast);
    // this.isModalOpen = false;
  }

  confirmApproval(action: string, data?: any) {
    this.approvePcs(action)
  }

  approvePcs(action: string) {
    console.log(action)
  }

  closeModal() {
    this.isModalOpen = false;
    this.isapprovalsModalOpen = false;
    this.remarkModel = '';
    this.toResetCartonPackName = '';
    this.toCancelCartonPackName = '';
    console.warn('Clear carton is cancelled!')
  }

  async canLeave() {
    await this.ionicGuards.canLeave(false);
  }

  assignAccordionOpen() {
    this.expandAccordion = '1'
    setTimeout(() => {
      if (this.poModel.order_ponumber == "All") {
        this.expandAccordion = "1 2 3 4 5"
      } else {
      }

    }, 2000);
  }

  assignHeaderIcons() {
    let icons = [{
      iconName: 'scan',
      navTo: '/cartonpacking'
    }]

    return icons
  }

  cumulativeCartonPcs(items) {

    const totalValue = items?.reduce((total, item) => {
      return total + item.box_quantity;
    }, 0);

    return totalValue;
  }

}
