import {
  Component,
  ElementRef,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IonInput, IonModal, NavController } from '@ionic/angular';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DataService } from '../../../providers/dataService/data-service';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { Scartonpacking } from '../services/scartonpacking';
import { IonicGuards } from '../../../guards/ionic-guards';
import { StorageService } from '../../../providers/storage/storage-service';

@Component({
  selector: 'app-cartonpacking-garmentscan',
  templateUrl: './cartonpacking-garmentscan.page.html',
  styleUrls: [
    './cartonpacking-garmentscan.page.scss',
    '../cartonpacking-master/cartonpacking.page.scss',
  ],
  standalone: false,
})
export class CartonpackingGarmentscanPage implements OnInit {
  user: string = '';

  cartonBoxQrDetails: any = '';
  accomodateSizeQty: any = [];
  mapped_po: any = '';
  packedStatus: any = '';
  packAlterStatus: any = '';

  totalPieces: number = 0;
  totalPiecesLoaded: number = 0;

  garmentRawList: any = [];
  garmentUpdateList: any = [];
  garmentBarcodeData: string | number | null = '';

  poList: any = [];
  poModel: any = '';
  isPoSelect: boolean = false;

  colorList: any = [];
  colorModel: any = '';
  isColorSelect: boolean = false;

  unpackedSize: any = '';
  sizeToRemove: any = '';
  sizeToRemoveName: string = '';
  cartonRemove: boolean = false;

  remarkList: any = [];
  remarkModel: any = '';
  remarksArr: any = [];
  isRemarkSelect: boolean = false;

  animateBarcode: any = '-1';
  animateSizeCard: any = {};

  isClosed: boolean = false;

  isScanReady: boolean = true;

  isAvailablePcs: any = false;
  isAvailablePcsSub!: Subscription;
  isRemovePcs: boolean = false;
  isRemovePcsSub!: Subscription;

  isInspection: boolean = false;
  alterInspection: boolean = false;
  repackInspection: boolean = false;

  isModalOpen: boolean = false;

  pcsAdded: boolean = false;

  unsavedChanges: boolean = false;

  barcodeToSizeMap = new Map();

  inputReady: boolean = false;
  pendingRefocus: boolean = false;

  refocusSub!: Subscription;

  // @ViewChild('garmentBarcodeInput', { static: false })
  // garmentBarcodeInput!: IonInput;
  @ViewChild('garmentBarcodeInput') set garmentInput(el: any) {
    if (el) {
      this.garmentBarcodeInput = el;
      this.inputReady = true;

      // If a refocus was requested earlier, do it now
      if (this.pendingRefocus) {
        this.clearAndRefocus();
        this.pendingRefocus = false;
      }
    }
  }
  garmentBarcodeInput: any;

  @ViewChild('container', { static: false })
  container!: ElementRef<HTMLDivElement>;

  @ViewChild('modal', { static: false }) modal!: IonModal;

  private garmentInputSubject = new Subject<string>();
  private inputSub: any;

  constructor(
    private dataService: DataService,
    private reusableService: ReusableService,
    private ionicGuards: IonicGuards,
    private storageService: StorageService,
    private navCtrl: NavController,
    private cartonService: Scartonpacking,
  ) { }

  ngOnInit() {
    let cartonData = this.cartonService.getCartonDetails();
    if (cartonData) {
      this.poList = cartonData['poList'];
      this.mapped_po = cartonData['mapped_po'];
      this.cartonBoxQrDetails = { ...cartonData['cartonBoxQrDetails'][0] };
      this.accomodateSizeQty = this.cartonBoxQrDetails['size_qty_details'];
      this.packedStatus = this.cartonBoxQrDetails.cartonpacking_status;
      //  this.packedStatus = 'PACKED';
      this.packAlterStatus = this.cartonBoxQrDetails.packing_alter_detail;
      let user = this.storageService.getData('userData');
      this.user = user.role;
    }

    if (this.mapped_po) {
      this.addGarmentinitialData();

      for (let q of this.poList) {
        if (q['order_ponumber'] == this.mapped_po) {
          this.poModel = q;
          this.packAlterStatus == 'cl' ? '' : this.isPoSelect = true;
        }
      }
    }

    this.refocusSub = this.cartonService.refocus$
      .subscribe(() => {
        if (this.inputReady) {
          this.clearAndRefocus();
        } else {
          this.pendingRefocus = true;
        }
      });

    this.isAvailablePcsSub = this.cartonService.isAvailablePcs$
      .subscribe(value => {
        this.isAvailablePcs = value;
        console.log('Available PCS:', value);
      });

    this.isRemovePcsSub = this.cartonService.isRemovePcs$
      .subscribe(value => {
        this.isRemovePcs = value;
        console.log('Remove PCS:', value);
      });

    console.log(this.isAvailablePcs, 'availablePcs')
  }

  // moved to service...
  setLoadedColor() {
    const color = this.garmentUpdateList.find(c =>
      c.sizes.some(s =>
        s.current_carton_pcs !== 0 || this.packedStatus === 'PACKED'
      )
    );

    if (color) {
      this.colorModel = {
        color: color.color,
        color_seq_num: color.color_seq_num
      };
      this.packAlterStatus == 'cl' ? '' : this.isColorSelect = true;

    }
    // for (let q of this.garmentUpdateList) {
    //   for (let qq of q['sizes']) {
    //     if (qq['current_carton_pcs'] != 0 || this.packedStatus == 'PACKED') {
    //       // if (qq['current_carton_pcs'] != 0 || this.packedStatus == 'S') {
    //       this.colorModel = { color: q.color, color_seq_num: q.color_seq_num }
    //       this.packAlterStatus == 'cl' ? '' : this.isColorSelect = true;
    //       return;
    //     }
    //   };
    // };
    console.log(this.colorModel, 'from setLoadedColor')
  }

  scrollToSizeBox(scrollIndex: any) {
    console.log('scroll', scrollIndex);
    let inc = Math.floor(scrollIndex / 2);
    this.container.nativeElement.scrollTo({
      top: inc * 500,
      behavior: 'smooth',
    });
  }

  //Dashboard Funcs:

  //temp refresh
  refresh() {
    this.addGarmentinitialData();
    let toast = {
      message: 'Data refreshed by Admin',
      color: 'success'
    }
    this.reusableService.showToast(toast)
  }

  async addGarmentinitialData() {
    // flags
    let colorList = [];
    this.colorModel = '';

    //http post
    let params = {
      path: 'cartonpacking_scan/getpodetails',
      order_seq_num: this.cartonBoxQrDetails.order_seq_num,
      ponumber: this.mapped_po ? this.mapped_po : this.poModel['order_ponumber'],
      cartonbox_qrcode_seq_num: this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      cartonbox_qrcode: this.cartonBoxQrDetails.qrcode_format,
      cartonbox_header_seq_num: this.cartonBoxQrDetails.cartonbox_header_seq_num,
      cartonpacking_status: this.packedStatus,
    };
    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.garmentRawList = res['garmentpacking'];
        this.garmentUpdateList = JSON.parse(
          JSON.stringify(this.garmentRawList)
        );
        console.log('garmentUpdatelist', this.garmentUpdateList);

        //Color seperation being done here
        for (const item of this.garmentUpdateList) {
          colorList.push({
            color: item.color,
            color_seq_num: item.color_seq_num,
          });
          console.log('colorList', this.colorList);

          for (const size of item['sizes']) {

            // maxcapacity being added from the accomodate sizeQty
            for (const estQty of this.accomodateSizeQty) {
              if (size.size_seq_num == estQty.size_seq_num) {
                size['max_capacity'] = estQty.sizeQty;
                item['sizes'].length > 1
                  ? (this.totalPieces += +size['max_capacity'])
                  : '';
                console.log('maxcapacity', size['max_capacity']);
                break;
              }
            }
            size['balance_packed'] = Math.max(
              0,
              +size['max_capacity'] - +size['current_carton_pcs']
            ); // balance_packed gets overwritten for repack in the setInspType()
            if (size['remove_qty_count']) {
              size['removed_data'] = size['remove_qty_count']
            }

            if (size['testingpcs_qty_count']) {
              size['testingpcs_qty_count'] = Math.max(0, +size.testingpcs_qty_count - +size.remove_qty_count)
              console.log(size[
                'testingpcs_qty_count'
              ], size[
              'barcode_data'
              ])
            }

            //Using HASHMAP
            this.barcodeToSizeMap.set(size.barcode_data, { color: { color: item.color, color_seq_num: item.color_seq_num }, size: size })
          }
        }

        this.cartonService.addInitalGarmentData(this.barcodeToSizeMap)
        this.cumTotalCartonPcs();
        this.colorList = colorList; //to collect all the data and then store in variable

        console.log('barcodeHashMap', this.barcodeToSizeMap)
        console.log('garmentList', this.garmentUpdateList);

        //flags
        this.isColorSelect = false;
        this.isClosed = false;
        this.isScanReady = true;
        if (this.mapped_po) {
          // this.setLoadedColor(); 
          this.colorModel = this.cartonService.setLoadedColor(this.garmentUpdateList);
          this.colorModel ? this.isColorSelect = true : '';
          console.log('colorModel', this.colorModel)
        };

      } else {
        let alert = {
          msg: res['message'],
        };

        this.reusableService.showAlert(alert);
      }
    });
  }

  // cartonpacking scan funcs:
  async confirmRemoveGarment(action: string, garmentSize?: any) {
    let alert = {
      header: `❓ Remove size ${garmentSize.size}`,
      msg: 'Remove pcs from box?',
      btn: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          role: 'confirm',
          func: () => {
            this.removeGarment(action, garmentSize);
          },
        },
      ],
    };

    await this.reusableService.showAlert(alert);
  }

  async removeGarment(action?: string, size?: any) {

    if (action == 'garment') {
      if (size.current_carton_pcs > 0) {
        let toastmsg = '';

        //if the remove becomes zero after adding pcs then this will not run
        if (size.remove_qty_count && !(size.removed_data == size.remove_qty_count)) {

          size.remove_qty_count++;
          if (size.current_carton_pcs <= size.max_capacity) size.balance_packed++;
          size.current_carton_pcs = this.dec(size.current_carton_pcs);

        } else if (!size.remove_qty_count) {

          size.balance_popp_qty_load++;
          if (size.current_carton_pcs <= size.max_capacity) size.balance_packed++;
          size.current_carton_pcs = this.dec(size.current_carton_pcs);

        } else {
          toastmsg = '❌ Can\'t remove more pieces'
        }

        let toast = {
          message: toastmsg || '🗑 Removed Successfully',
          color: toastmsg ? 'dark' : 'success',
        };
        await this.reusableService.showToast(toast);

      } else if (size.current_carton_pcs == 0) {
        let toast = {
          message: '⚠️ No more sizes to remove',
          color: 'primary',
        };
        await this.reusableService.showToast(toast);
      }

      setTimeout(() => {
        this.clearAndRefocus();
      }, 600);
    }
  }

  // cartonpacking inspection scan funcs
  setInspType(action: string) {
    this.isInspection = true;

    // calling the remark list here
    if (action != 'add') {

      // remove remark_type = 1
      // repack remark_type = 2
      // reset remark_type = 3
      // cancel remark_type = 4

      // this remark_seq_num updates the row in the alter table overriding the previous (remove)remark_seq_num so we might need to add a new column...(NOTE: need to discuss on this)

      let params = {
        path: 'cartonpacking_scan/getcartonpacking_remark_list',
        remark_type: action == 'repack' ? '2' : '1'
      };

      this.dataService.postService(params).then((res: any) => {
        if (res['status'].toLowerCase() == 'success') {
          this.remarkList = res['Remarklist'];
        }
      });
    }
    if (action == 'removeCarton') {
      console.log(this.alterInspection, 'remove type');
      // we will be calling the removeRemamrksList service here
      this.confirmRemovePcs('carton');
      console.log('Remove carton triggered')
    } else if (action == 'add') {
      this.alterInspection = true;
      console.log(this.alterInspection, 'add type');
    } else if (action == 'repack') {
      this.totalPieces = 0;
      for (const item of this.garmentUpdateList) {
        for (const size of item['sizes']) {
          size['previous_packed_pcs'] = +size['current_carton_pcs'];
          size['display_previous_packed'] = +size['current_carton_pcs'];
          size['balance_packed'] = size['max_capacity'];
          // size['balance_popp_qty_load'] += +size['current_carton_pcs'];
          size['current_carton_pcs'] = 0;
          this.totalPieces += +size['previous_packed_pcs'];
        }
      }
      this.repackInspection = true;
      console.log(this.repackInspection, 'repack type');
    }
  }

  async confirmRemovePcs(removeType?: string) {
    if (removeType == 'carton') {
      //concept of taking the whole carton to pending/inspection making all the contents inside it to be considered as the removed/pending status,(for setting the status we are gonna use the onSubmit() service from the modal)....
      this.isModalOpen = true;
      this.cartonRemove = true;
      return;
    }
    const validBarcode = this.barcodeToSizeMap.get(this.garmentBarcodeData);
    if (!validBarcode) return; //if barcode is not valid return

    const { color, size } = validBarcode;

    if (size.current_carton_pcs > 0) {
      this.isModalOpen = true; // this will open the modal for remarks
      this.sizeToRemove = size;
      this.sizeToRemoveName = size.size;
    } else {
      let alert = {
        header: '🛑 No sizes',
        msg: 'No more sizes to remove',
        btn: {
          text: 'OK',
          role: 'conifrm',
          func: () => {
            this.clearAndRefocus();
          },
        },
      };
      await this.reusableService.playAudio('warning');
      await this.reusableService.showAlert(alert);
    }
  }

  async removePcsScan() {
    console.log('removing scan with remarks', this.remarkModel);
    this.sizeToRemove['remarks'] = this.remarkModel.remarks;
    this.sizeToRemove['remarks_seq_num'] = this.remarkModel.remarks_seq_num;

    //http post
    let params = {
      path: 'cartonpacking_scan/cartonpacking_alter_remove',
      cartonbox_qrcode_seq_num:
        this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      qrcode_format: this.cartonBoxQrDetails.qrcode_format,
      cartonbox_header_seq_num:
        this.cartonBoxQrDetails.cartonbox_header_seq_num,
      cartonpacking_status: this.packedStatus,
      color_seq_num: this.colorModel['color_seq_num'],
      ponumber: this.poModel['order_ponumber'],
      remove_piece: JSON.stringify(this.sizeToRemove) //if carton remove is true we will send this as empty... (NOTE: USING the 'SAVE_SCANNED_SIZES' service in onSubmit() for the remove Carton)
    };

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        let toast = {
          message: `Removed size: ${this.sizeToRemoveName}`,
          color: 'success',
          position: 'top',
        };

        await this.reusableService.showToast(toast);
        await this.liveQuantityCheck();
        this.clearAndRefocus();
      }
    });

    this.remarkModel = ''
    this.closeModal();
  }

  // Submit functions common for cartonpacking and cartonpacking_inspection
  canClose(type?: string) {

    // we might probably be checking the quantity before letting them save in repack (so that )
    if (type == 'repack') {
      let morePcs = this.garmentUpdateList[0].sizes.filter(s => s.display_previous_packed < s.current_carton_pcs);
      let lessPcs = this.garmentUpdateList[0].sizes.filter(s => s.display_previous_packed > s.current_carton_pcs);

      if (morePcs || lessPcs) {
        // can expect seperate remarks here
      } else if (lessPcs) {
        // can expect seperate remarks here
      } else {
        // can expect seperate remarks here
      }

      this.isModalOpen = true;
    } else {
      let alertmsg = '';
      if (this.totalPiecesLoaded < this.totalPieces) {
        // alertmsg = `Box Qty ${this.totalPiecesLoaded} is lesser than Total Qty ${this.totalPieces},`;
      } else if (this.totalPiecesLoaded > this.totalPieces) {
        // alertmsg = `Box Qty ${this.totalPiecesLoaded} is more than Total Qty ${this.totalPieces},`;
      }
      else {
        alertmsg = ''
      }

      let alert = {
        // msg: alertmsg + 'Do you want to submit?',
        msg: 'Do you want to submit?',
        btn: [
          {
            text: 'Cancel',
            role: 'cancel',
            func: () => { },
          },
          {
            text: 'OK',
            role: 'confirm',
            func: () => {
              this.onSubmit();
            },
          },
        ],
      };

      this.reusableService.showAlert(alert);
    }


  }

  onSubmit(action?: string) {
    console.log(this.remarkModel, 'remarkModel');
    this.packedStatus = 'PACKED'
    //conditions
    let submitType = (action == 'removeCarton') ? 'TESTCARTON' : 'PACKED';
    let isRemarkSeqNum = this.remarkModel ? this.remarkModel.remarks_seq_num : '';
    let test_pcs = this.isAvailablePcs ? 'Yes' : 'No';
    let remove_pcs = this.isRemovePcs ? 'Yes' : 'No';

    //http post
    let params = {
      path: 'cartonpacking_scan/save_scanned_sizes',
      cartonbox_qrcode_seq_num:
        this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      qrcode_format: this.cartonBoxQrDetails.qrcode_format,
      cartonbox_header_seq_num:
        this.cartonBoxQrDetails.cartonbox_header_seq_num,
      ponumber: this.poModel['order_ponumber'],
      cartonpacking_status: this.packedStatus, // PACKED throughout
      request_type: submitType, // status concerning the cartonpack
      remarks_seq_num: isRemarkSeqNum,
      test_pcs_another_box: test_pcs,
      remove_pcs: remove_pcs,
      is_repack: this.repackInspection ? 'REPACK' : '',
      garmentpacking: JSON.stringify(this.garmentUpdateList),
    };

    this.dataService.postService(params).then((res) => {
      if (res['status'].toLowerCase() == 'success') {
        this.liveQuantityCheck();
        if (this.packedStatus == 'PACKED') {
          // if (this.packedStatus == 'S' && action != 'removeCarton') {
          let toast = {
            message: '☑️ Carton Box Updated!',
            color: 'success',
            position: 'top',
          };

          this.reusableService.showToast(toast);

          //flags
          this.isClosed = true;
          this.pcsAdded = false;
          this.remarkModel = '';
        }

        // if (action == 'close') this.onClose();
        if (action == 'removeCarton') {
          this.closeModal();
          let toast = {
            message: '☑️ Carton Box removed!',
            color: 'warning',
            position: 'top',
          };

          this.reusableService.showToast(toast);
        }
        this.navCtrl.back();

      }
    });
    console.log('this is submitted', this.garmentUpdateList);
  }

  // close(SEALED) thing might be used with this func
  onClose() {
    let params = {
      path: 'cartonpacking_scan/carton_box_close',
      cartonbox_qrcode_seq_num:
        this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      cartonbox_header_seq_num:
        this.cartonBoxQrDetails.cartonbox_header_seq_num,
      ponumber: this.poModel['order_ponumber'],
      packing_status: 'SEALED' //recheck function will work just like packed and not like sealed (SEALED WILL BE DISCUSSED LATER)
    };
    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        let toast = {
          message: '📦 Carton Box Sealed!',
          color: 'success',
          position: 'top',
        };

        await this.reusableService.showToast(toast);

        this.isPoSelect = false;
        this.isClosed = true;
        this.animateSizeCard = {};
        this.colorList = [];
        this.navCtrl.back();
      }
    });
  }

  // Modal funcs:
  async closeModal() {
    //flags
    await this.modal.dismiss();
    this.isModalOpen = false;
    this.remarkModel = '';
    this.cartonRemove = false;
    // this.clearAndRefocus();
  }

  // Scanner box funcs:
  gInpF: boolean = false;
  setFocus() {
    this.garmentBarcodeInput.setFocus();
    this.gInpF = true;
    console.log('garment focused');
  }

  ngAfterViewInit(): void {
    this.inputSub = this.garmentInputSubject
      .pipe(debounceTime(500))
      .subscribe(async (val: any) => {
        this.garmentBarcodeData = val;
        this.animateBarcode = val;
        setTimeout(() => {
          this.animateBarcode = '-1';
          this.animateSizeCard = '';
        }, 500);
        // (this.packedStatus == 'PACKED') ?
        //   (this.alterInspection || this.repackInspection) ? this.addPcsScan() : this.confirmRemovePcs()
        //   : this.addScan();

        if (this.packedStatus == 'PACKED') {
          if (this.alterInspection) {
            this.animateSizeCard = await this.cartonService.handleScan('ADDPCS', this.garmentBarcodeData)
          } else if (this.repackInspection) {
            this.animateSizeCard = await this.cartonService.handleScan('REPACK', this.garmentBarcodeData)
          } else {
            // remove pcs feature
            this.confirmRemovePcs()
          }
          return;
        } else {
          //initial packing
          this.animateSizeCard = await this.cartonService.handleScan('PACK', this.garmentBarcodeData)
        }

        // flags
        this.isPoSelect = true;
        this.isColorSelect = true;
      });
  }

  onGarmentInput(event: any, isBut?) {
    // const value = event.detail.value.trim();
    const value = isBut ? this.garmentBarcodeData : event.detail.value;
    this.garmentInputSubject.next(value);
  }

  //reusable func:
  cumTotalCartonPcs() {
    this.totalPiecesLoaded = 0;

    for (let item of this.garmentUpdateList) {
      for (let size of item['sizes']) {
        this.totalPiecesLoaded += size.current_carton_pcs;

        if (size.max_capacity > 0 && size.current_carton_pcs == 0) {
          this.unpackedSize = size;
        }
      }
    }
    return this.totalPiecesLoaded;
  }

  dec = (v: number | string) => Math.max(0, +v - 1); //this to decrease data

  i = 0;
  liveQuantityCheck() {
    console.log('LiveQuantity check working', (this.i += 1));
    let params = {
      path: 'cartonpacking_scan/getpodetails',
      order_seq_num: this.cartonBoxQrDetails.order_seq_num,
      ponumber: this.poModel['order_ponumber'],
      cartonbox_qrcode: this.cartonBoxQrDetails.qrcode_format,
      cartonbox_header_seq_num:
        this.cartonBoxQrDetails.cartonbox_header_seq_num,
      cartonbox_qrcode_seq_num:
        this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      cartonpacking_status: this.packedStatus,

    };

    console.log('cartonbox', this.cartonBoxQrDetails.qrcode_format);
    // this.showLoading();
    this.dataService.postService(params).then((res: any) => {
      if (
        res['status'].toLowerCase() == 'success' &&
        this.garmentUpdateList.length > 0
      ) {
        this.garmentRawList = res['garmentpacking'];
        let abspacked = res['garmentpacking'];

        for (const colorgrp of this.garmentUpdateList) {
          let sameColor = abspacked.find(
            (ele: any) => ele.color == colorgrp.color
          );
          if (!sameColor) continue;

          for (const size of colorgrp['sizes']) {
            let sameSize = sameColor.sizes.find(
              (ele: any) => ele.size_seq_num == size.size_seq_num
            );
            if (size['size_seq_num'] == sameSize['size_seq_num']) {
              for (const estQty of this.accomodateSizeQty) {
                if (size.size_seq_num == estQty.size_seq_num) {
                  size['max_capacity'] = estQty.sizeQty;
                  console.log('maxcapacity', size['max_capacity']);
                  break;
                }
              }
              size['balance_packed'] = Math.max(
                0,
                +size['max_capacity'] - +size['current_carton_pcs']
              );
              size['poqty_packed'] = sameSize['poqty_packed'];
              size['current_carton_pcs'] = +sameSize['current_carton_pcs'];
              size['balance_popp_qty_load'] =
                +sameSize['balance_popp_qty_load'];
              size['remove_qty_count'] = +sameSize['remove_qty_count']
            }
          }
        }
        this.cumTotalCartonPcs();
      }
      // this.cancelLoading();
    });
    // this.clearAndRefocus();
  }

  async clearAndRefocus() {
    this.garmentBarcodeData = '';
    this.remarkModel = '';
    console.log('clear and refocus function');
    this.isScanReady = true;
    this.gInpF = true;
    setTimeout(() => {
      this.reusableService.stopAudio();
    }, 4000);

    setTimeout(async () => {
      if (this.garmentBarcodeInput) {
        // const el = await this.garmentBarcodeInput.getInputElement();
        // el.focus();
        this.setFocus();
      }
    }, 100);
  }

  async isValidBarcode() {
    let validBarcode = this.barcodeToSizeMap.get(this.garmentBarcodeData)
    if (!validBarcode) {
      let barcode = this.garmentBarcodeData || '--';
      this.reusableService.playAudio('warning');
      console.error('Not a valid barcode for this data');
      this.garmentBarcodeData = '';
      let alert = {
        header: '⚠️ Error',
        msg: `Invalid barcode: ${barcode}`,
        btn: [
          {
            text: 'OK',
            role: 'confirm',
            func: () => {
              this.reusableService.stopAudio();
              this.clearAndRefocus();
            }
          },
        ],
      };

      await this.reusableService.showAlert(alert);
      return null;
    }

    return validBarcode;
  }

  async canLeave() {
    if (
      (this.isPoSelect &&
        this.packedStatus != 'SEALED') || this.pcsAdded
      // this.packedStatus != 'S') || this.pcsAdded
    ) {
      this.unsavedChanges = true;
    } else {
      this.unsavedChanges = false;
    }
    await this.ionicGuards.canLeave(this.unsavedChanges);
  }

  ngOnDestroy() {
    if (this.inputSub) {
      this.inputSub.unsubscribe();
    }

    if (this.refocusSub) {
      this.refocusSub.unsubscribe();
    }

    // this makes the value false and 
    this.cartonService.isAvailablePcs.next(false);
    this.isAvailablePcsSub.unsubscribe();

    this.reusableService.stopAudio();
  }
}