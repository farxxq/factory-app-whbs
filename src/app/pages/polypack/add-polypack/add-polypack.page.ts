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
  selector: 'app-add-polypack',
  templateUrl: './add-polypack.page.html',
  styleUrls: [
    './add-polypack.page.scss',
    '../polypack-master/polypack-master.page.scss',
  ],
  standalone: false,
})
export class AddPolypackPage implements OnInit {
  filterDataList: any = {};
  poNum: any = ''

  barcodeData: any = '';
  copyBarcodeData: any;

  isScanner: any = '';

  editSizeItem: any;
  editPolyQty: any;

  fullSizeList: any = [];
  sizeListBarcodeArr: any = [];
  rawQtyList: any = [];

  polypackBalance!: number;

  totalQty: number = 0;
  totalInitialQty: number = 0;

  showAllSizesEntry: any = -1;

  animateColorTd: any = '';

  backButtonSub!: Subscription;

  deviceType: string = '';

  // not used for now
  // private qtyInputSubject = new Subject<any>();
  // @ViewChild('qtyInput', { static: false }) qtyInput!: IonInput;

  @ViewChild('modal', { static: false }) modal!: IonModal;

  private sizeInputSubject = new Subject<any>();
  @ViewChild('sizeInput', { static: false }) sizeInput!: IonInput;

  @ViewChild('container', { static: false }) container!: ElementRef<HTMLDivElement>;

  private inputSub: any;

  //flags
  submittedF: boolean = false;
  scanQrF: boolean = false;
  genQrF: boolean = false;
  isModalOpen: boolean = false;
  editF: boolean = false;

  public unsavedChanges: boolean = false;

  constructor(
    private dataService: DataService,
    private reusableService: ReusableService,
    private storageService: StorageService,
    private polypackService: Spolypack,
    private platform: Platform,
    private navCtrl: NavController,
    private ionicGuards: IonicGuards,
    private ionRouterOutlet: IonRouterOutlet
  ) { }

  // showLoading = async () => await this.reusableService.showLoading();
  // cancelLoading = async () => await this.reusableService.cancelLoading();

  ngOnInit() {
    this.filterDataList = this.polypackService.getAddData();
    this.isScanner = this.storageService.getData('isScanner');
    this.deviceType = this.reusableService.deviceType()
    console.log(this.filterDataList, 'filterDataList')

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
      orderponum: this.poNum,
    };

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.rawQtyList = res;

        // some random concept *** remove it probably
        // for (const item of this.rawQtyList.sizedata) {
        //   if(item.barcode != item.barcode){

        //   }
        // }

        // this.fullSizeList = JSON.parse(JSON.stringify(this.rawQtyList));
        this.fullSizeList = this.reusableService.rearrangeData(res['sizedata'], 'size_name');
        let totalnum = 0;
        for (const list of this.fullSizeList) {
          list['polypack_qty'] = null;

          // let balance = 
          // list.total_pcssize_elc_qty
          //   ? list.total_pcssize_elc_qty <= list.total_order_size_qty
          //     ? list.total_pcssize_elc_qty - list.total_pcssize_poly_qty
          //     : list.total_order_size_qty - list.total_pcssize_poly_qty
          //   : list.total_order_size_qty - list.total_pcssize_poly_qty;

          let balance = list.total_order_size_qty - list.total_pcssize_poly_qty;
          list['polypack_balance'] = Math.max(0, balance);

          if (list['barcode'] && !this.sizeListBarcodeArr.includes(list['barcode'])) {
            this.sizeListBarcodeArr.push(list['barcode']);
          }
          // list.total_pcssize_elc_qty
          //   ? list.total_pcssize_elc_qty - list.total_pcssize_poly_qty
          //   : list.total_order_size_qty - list.total_pcssize_poly_qty;

          // list['isEdit'] = false; //edit has been disabled for now
          this.totalInitialQty += +list['total_pcssize_poly_qty']
        }

        this.poNum = this.filterDataList.poNum['order_ponumber'] ? this.filterDataList.poNum['order_ponumber'] : '';

        //to increment the scanned size from the polypack-home page
        if (this.isScanner) {
          setTimeout(() => {
            let barcode = this.filterDataList.sizeBarcode;
            this.startScan(barcode);
          }, 300)
        }

        console.log('fullSizeListInitial: ', this.fullSizeList);
        console.log('orderQtyList', this.rawQtyList);
      } else {
        let toast = {
          message: res['message'],
          color: 'warning',
        };
        this.reusableService.showToast(toast);
      }
    });
  }

  // scanner functions:
  async startScan(barcode: any) {
    let inc = 0;
    for (const size of this.fullSizeList) {
      let barcode_data = barcode.trim();
      let data = this.sizeListBarcodeArr.includes(barcode_data);
      if (!data) {
        let alert = {
          header: '⚠️ Error',
          msg: `Invalid barcode: ${barcode}`,
          btn: [
            {
              text: 'OK',
              role: 'confirm',
              func: () => {
                this.clearAndRefocus();
              }
            },
          ],
        };

        await this.reusableService.showAlert(alert);
        return;
      }
      if (size.barcode == barcode) {
        this.showAllSizesEntry = -2; //to restrict the showing of all the sizes

        this.isValidQty(size);
        size.polypack_qty++;

        this.animateColorTd = size;
        this.setScrollPostion(barcode);
        // this.scrollToSizeBox(inc);
        //  this.scrollToCard(inc); //temp checking
      }
      if (size.polypack_qty || this.showAllSizesEntry > -1) inc++;
    }
  }

  setScrollPostion(data: any) {
    let inc = -1;

    //if(this.showAllSizesEntry!= -1)inc++;

    for (const size of this.fullSizeList) {
      if (size.polypack_qty) {
        inc++;
      }
      else if (data.size_name == size.size_name) {
        inc++;
        break
      };
      if (size.barcode == data.barcode || size.size_name == data.size_name) break;
    }

    console.log("inc", inc)


    this.scrollToSizeBox(inc); //temp checking
  }



  sInpF: boolean = false;
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
        if (this.barcodeData) this.startScan(this.barcodeData);

        setTimeout(() => {
          this.copyBarcodeData = this.barcodeData;
          this.barcodeData = '';
          this.animateColorTd = '';
        }, 300);

      });
  }

  async clearAndRefocus() {
    this.barcodeData = '';
    console.log('clear and refocus function');
    setTimeout(() => {
      this.reusableService.stopAudio();
    }, 2000);
    this.setFocus();
  }

  onSizeInput(event: any, index?: any) {
    const value = event.detail.value.trim();
    console.log('sizeInput is triggered', value);
    if (value) this.sizeInputSubject.next(value);
  }

  // Interactive functions
  async isValidQty(item: any) {
    if (
      typeof item.polypack_qty === 'string' &&
      item.polypack_qty.includes('.')
    ) {
      item.polypack_qty = item.polypack_qty.split('.')[0];
    }
    if (item.polypack_qty > item.polypack_balance) {
      let msg = `Packed Qty - ${item?.['polypack_qty']} is more than the ELC/PO quantity - ${item['polypack_balance']}`;

      let alert = {
        msg: msg,
        btn: [
          {
            text: 'Cancel',
            role: 'cancel',
            func: () => {
              this.isScanner ? item.polypack_qty-- : item.polypack_qty = null;
              this.totalAddedQty();
              return;
            },
          },
          {
            text: 'Proceed',
            role: 'confirm',
            func: () => {
              this.totalAddedQty();
              return;
            },
          },
        ],
      };

      await this.reusableService.showAlert(alert);
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

  scrollToSizeBox(scrollIndex: any) {
    console.log('scroll', scrollIndex);
    this.container.nativeElement.scrollTo({
      top: scrollIndex * 348,
      behavior: 'smooth',
    });
  }

  sizeChip(index: any, size?: any) {
    this.showAllSizesEntry = index;
    setTimeout(() => {
      this.animateColorTd = size;
      this.setScrollPostion(size);
    }, 100)
  }

  removeSize(item: any) {
    if (!item.polypack_qty) {
      let toast = {
        message: `No pcs to remove!`,
        color: 'danger'
      }

      this.reusableService.showToast(toast);
      return;
    }

    let alert = {
      msg: `Remove pcs from size ${item.size_name}?`,
      btn: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Proceed',
          role: 'confirm',
          func: () => {
            item.polypack_qty--;
            let toast = {
              message: `Removed pcs from size ${item.size_name}`,
              color: 'success'
            }

            this.reusableService.showToast(toast);
            this.totalAddedQty();
          }
        }
      ]
    }

    this.reusableService.showAlert(alert);
  }

  //modal Functions
  openModal(item: any) {
    //flags
    this.isModalOpen = true;
    this.editSizeItem = item;
  }

  closeModal() {
    //flags
    this.modal.dismiss();
    this.editSizeItem = '';
    this.editPolyQty = '';
    this.isModalOpen = false;
  }

  //Submit functions
  async onEditSubmit() {
    console.log('Edit button');

    console.log(
      'string to int size item?',
      parseInt(this.editSizeItem.total_pcssize_poly_qty)
    );

    let polyTotal = parseInt(this.editSizeItem.total_pcssize_poly_qty);
    let editPoly = parseInt(this.editPolyQty);

    if (editPoly && polyTotal === editPoly && false) { //we can expect the value to be equal
      let toast = {
        message: 'Same qty entered',
        color: 'dark',
      };
      await this.reusableService.showToast(toast);

      //flags
      this.isModalOpen = false;
      this.editPolyQty = '';
      // return;
    }
    else if (polyTotal > editPoly) {
      console.log(polyTotal < editPoly, 'quantity less or more?');

      for (const list of this.fullSizeList) {
        if (
          list.order_details_seq_num === this.editSizeItem.order_details_seq_num
        ) {
          // list['edit_pcssize_poly_qty'] = editPoly;
          // list['polypack_balance'] =
          //   list.total_order_size_qty - list.edit_pcssize_poly_qty; //after edit we are recalculating the balance
          // list['isEdit'] = true;

          // onSubmit function to be used here instead
          this.onSubmit(true);

          let params = {
            path: 'carton_packing/polypack_size_qtyupdate',
            order_seq_num: this.rawQtyList.order_seq_num,
            total_pcssize_poly_qty: editPoly,
            color_seq_num: this.rawQtyList.color_seq_num,
            size_seq_num: list['size_seq_num'],
            order_details_seq_num: list['order_details_seq_num'],
            order_ponumber: this.poNum
          };

          // this.dataService.postService(params).then((res: any) => {
          //   if (res['status'].toLowerCase() == 'success') {
          //     let toast = {
          //       message: 'Total packed quantity updated successfully',
          //       color: 'dark',
          //     };

          //     this.reusableService.showToast(toast);

          //     list['total_pcssize_poly_qty'] = editPoly;
          //     list['polypack_balance'] =
          //       Math.max(0, list.total_order_size_qty - list.total_pcssize_poly_qty); //after edit we are recalculating the balance
          //   }
          // });

          break;
        }
      }

      //flags
      this.isModalOpen = false;
      this.editPolyQty = '';
    } else {
      let alert = {
        // msg: `Qty entered: ${this.editPolyQty} cannot be more then the current packed qty: ${this.editSizeItem.total_pcssize_poly_qty}`,
        msg: `Invalid entry`,
        btn: [
          {
            text: 'OK',
            role: 'cancel',
            func: () => {
              this.editPolyQty = '';
              console.log(
                'Qty entered cannot be more then the current packed Qty'
              );
            },
          },
        ],
      };

      this.reusableService.showAlert(alert);
    }

    console.log('after forloop', this.fullSizeList, this.editPolyQty);
    console.log('Edited data fullList:', this.fullSizeList);
  }

  async confirmSubmit() {
    if (this.totalQty == 0 && !this.editSizeItem) {
      let toast = {
        message:
          'Atleast one Quantity should be filled',
        color: 'warning',
      };
      this.reusableService.showToast(toast);
      return;
    }

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

  onSubmit(edit_type?: boolean) {
    //http post
    let params = {
      path: 'carton_packing/cartonpackinginsert',
      colorseqnum: this.filterDataList.color['color_seq_num'],
      customerseqnum: this.filterDataList.customer['customer_seq_num'],
      orderseqnum: this.filterDataList.order['order_seq_num'],
      seasonseqnum: this.filterDataList.season['season_seq_num'],
      order_ponumber: this.poNum,
      store_type: edit_type ? 'edit' : 'add',
      sizedata: JSON.stringify(this.fullSizeList),
    };

    console.log('fullSizeList', this.fullSizeList);

    this.dataService.postService(params).then((res: any) => {
      let message: string = '';
      let color: string = '';

      if (res['status'].toLowerCase() == 'success') {
        color = 'success';
        if (!edit_type) {
          this.navCtrl.back();
          this.totalQty = 0;
          this.submittedF = true;
        } else {
          this.addQuantityInitialData();
        }
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

  // ionViewWillEnter() {
  //   // Subscribe when view is active
  //   this.backButtonSub = this.platform.backButton.subscribeWithPriority(
  //     10,
  //     () => {
  //       // Custom behavior
  //       this.canLeave();
  //     }
  //   );
  // }

  // temp concept for showing all the fields and updating it manually as well as scanner wise
  // setScannerFocus(index?: any) {
  //   // this.mapInput.setFocus();
  //   this.fullSizeList[index]['sInpF'] = true;
  //   console.log('carton box focused', this.fullSizeList[index]);
  // }

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
