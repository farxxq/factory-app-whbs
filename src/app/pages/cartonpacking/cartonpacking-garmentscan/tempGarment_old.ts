import {
  Component,
  ElementRef,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IonInput, IonModal } from '@ionic/angular';
import { debounceTime, Subject } from 'rxjs';
import { DataService } from 'src_newtempconcept/app/providers/dataService/data-servicedata-service';
import { ReusableService } from 'src_newtempconcept/app/providers/reusables/reusable-serviceable-service';
import { Scartonpacking } from '../services/scartonpacking';
import { IonicGuards } from 'src_newtempconcept/app/guards/ionic-guardsionic-guards';
import { StorageService } from 'src_newtempconcept/app/providers/storage/storage-servicerage-service';

// @Component({
//     selector: 'app-cartonpacking-garmentscan',
//     templateUrl: './cartonpacking-garmentscan.page.html',
//     styleUrls: [
//         './cartonpacking-garmentscan.page.scss',
//         '../cartonpacking-master/cartonpacking.page.scss',
//     ],
//     standalone: false,
// })
export class CartonpackingGarmentscanPage implements OnInit {
  cartonBoxQrDetails: any = '';
  accomodateSizeQty: any = [];
  mapped_po: any = '';
  isPacked: any = '';

  totalPieces: number = 0;
  totalPiecesLoaded: number = 0;

  garmentRawList: any = [];
  garmentUpdateList: any = [];
  garmentBarCodeDataArr: any = [];
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

  remarkList: any = [];
  remarkModel: any = '';
  remarksArr: any = [];
  isRemarkSelect: boolean = false;

  animateBarcode: any = '-1';
  animateColorTd: any = {};

  isClosed: boolean = false;

  isScanReady: boolean = true;

  isInspection: boolean = false;
  alterInspection: boolean = false;

  isModalOpen: boolean = false;

  pcsAdded: boolean = false;

  unsavedChanges: boolean = false;

  @ViewChild('garmentBarcodeInput', { static: false })
  garmentBarcodeInput!: IonInput;

  @ViewChild('container', { static: false })
  container!: ElementRef<HTMLDivElement>;

  @ViewChild('modal', { static: false }) modal!: IonModal;

  private garmentInputSubject = new Subject<string>();
  private inputSub: any;

  //Loading...
  showLoading = async () => await this.reusableService.showLoading();
  cancelLoading = async () => await this.reusableService.cancelLoading();

  constructor(
    private dataService: DataService,
    private reusableService: ReusableService,
    private cartonService: Scartonpacking,
    private ionicGuards: IonicGuards,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    let cartonData = this.cartonService.getCartonDetails();
    if (cartonData) {
      this.poList = cartonData[ 'poList' ];
      this.mapped_po = cartonData[ 'mapped_po' ];
      this.cartonBoxQrDetails = { ...cartonData[ 'cartonBoxQrDetails' ][ 0 ] };
      this.accomodateSizeQty = this.cartonBoxQrDetails[ 'size_qty_details' ];
      this.isPacked = this.cartonBoxQrDetails.cartonpacking_status;
    }

    if (this.mapped_po) {
      this.addGarmentInitialTableData();

      for (let q of this.poList) {
        if (q[ 'order_ponumber' ] == this.mapped_po) {
          this.poModel = q;
          this.isPoSelect = true;
        }
      }
    }
  }

  setLoadedColor() {
    for (let q of this.garmentUpdateList) {
      for (let qq of q[ 'sizes' ]) {
        if (qq[ 'current_carton_pcs' ] != 0 || this.isPacked == 'S') {
          this.colorModel = { color: q.color, color_seq_num: q.color_seq_num }
          this.isColorSelect = true;
          return;
        }
      };
    };
    console.log(this.colorModel, 'from setLoadedColor')
  }

  scrollTop(scrollIndex: any) {
    console.log('scroll', scrollIndex);
    let inc = Math.floor(scrollIndex / 2);
    this.container.nativeElement.scrollTo({
      top: inc * 500,
      behavior: 'smooth',
    });
  }

  //Table Funcs:
  async addGarmentInitialTableData() {
    // flags
    let colorList = [];
    this.colorModel = '';
    this.garmentBarCodeDataArr = [];

    //http post
    let params = {
      path: 'cartonpacking_scan/getpodetails',
      ponumber: this.mapped_po
        ? this.mapped_po
        : this.poModel[ 'order_ponumber' ],
      cartonbox_qrcode_seq_num:
        this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      cartonbox_qrcode: this.cartonBoxQrDetails.qrcode_format,
      cartonbox_header_seq_num:
        this.cartonBoxQrDetails.cartonbox_header_seq_num,
      cartonpacking_status: this.isPacked,
    };

    await this.showLoading();
    this.dataService.postService(params).then(async (res: any) => {
      if (res[ 'status' ].toLowerCase() == 'success') {
        this.garmentRawList = res[ 'garmentpacking' ];
        this.garmentUpdateList = JSON.parse(
          JSON.stringify(this.garmentRawList)
        );
        console.log('garmentUpdatelist', this.garmentUpdateList);

        if (this.garmentRawList.length > 0) {
          this.garmentRawList.forEach((item: any) => {
            item[ 'sizes' ].forEach((size: any) => {
              if (
                size[ 'barcode_data' ] &&
                !this.garmentBarCodeDataArr.includes(size[ 'barcode_data' ])
              ) {
                this.garmentBarCodeDataArr.push(size[ 'barcode_data' ]);
              }
            });
          });
        }

        //Color seperation being done here
        for (const item of this.garmentUpdateList) {
          colorList.push({
            color: item.color,
            color_seq_num: item.color_seq_num,
          });
          console.log('colorList', this.colorList);

          for (const size of item[ 'sizes' ]) {
            // maxcapacity being added from the accomodate sizeQty
            for (const estQty of this.accomodateSizeQty) {
              if (size.size_seq_num == estQty.size_seq_num) {
                size[ 'max_capacity' ] = estQty.sizeQty;
                item[ 'sizes' ].length > 1
                  ? (this.totalPieces += +size[ 'max_capacity' ])
                  : '';
                console.log('maxcapacity', size[ 'max_capacity' ]);
                break;
              }
            }
            size[ 'balance_packed' ] = Math.max(
              0,
              +size[ 'max_capacity' ] - +size[ 'current_carton_pcs' ]
            );
            if (size[ 'remove_qty_count' ]) {
              size[ 'removed_data' ] = size[ 'remove_qty_count' ]
            }

          }
        }
        this.cumTotalCartonPcs();
        this.colorList = colorList;

        console.log('garmentList', this.garmentUpdateList);

        //flags
        this.isColorSelect = false;
        this.isClosed = false;
        this.isScanReady = true;
        if (this.mapped_po) { this.setLoadedColor(); console.log('colorModel', this.colorModel) };

      } else {
        let alert = {
          msg: res[ 'message' ],
        };

        this.cancelLoading();
        this.reusableService.showAlert(alert);
      }
    });

    this.cancelLoading();
    console.log('garment barcodes', this.garmentBarCodeDataArr);
  }

  // cartonpacking scan funcs:
  async addScan(code?: any) {
    console.log('garment scan clicked');
    this.storageService.setData('garmentList', this.garmentUpdateList);
    let barcode = code ? code : this.garmentBarcodeData;
    console.log('barcode', barcode);

    this.isValidBarcode();

    for (const item of this.garmentUpdateList) {
      let inc = 0;
      for (const size of item[ 'sizes' ]) {
        if (size.barcode_data === this.garmentBarcodeData) {
          if (size.balance_popp_qty_load == 0 && size.remove_qty_count == 0) {
            let alert = {
              header: '❌ No Polypacked Pcs',
              msg: `There are no polypacked pcs for ${size.size} size`,
              btn: {
                text: 'OK',
                role: 'confirm',
                func: () => {
                  this.clearAndRefocus();
                }
              }
            };
            await this.reusableService.showAlert(alert);
            break;
          }
          if (size.max_capacity == 0 && size.balance_packed == 0) {
            this.isScanReady = false;
            if (
              size.balance_popp_qty_load > 0 &&
              size.current_carton_pcs == 0 // to have the alert only once
            ) {
              let alert = {
                header: '❓ Unknown garment',
                msg: "This Garment isn't assigned for the box, Want to continue anyways?",
                btn: [
                  {
                    text: 'Cancel',
                    role: 'confirm',
                    func: () => {
                      this.clearAndRefocus();
                    },
                  },
                  {
                    text: 'Yes',
                    role: 'confirm',
                    func: () => {
                      size.current_carton_pcs++;
                      size.balance_popp_qty_load = this.dec(
                        size.balance_popp_qty_load
                      );
                      this.clearAndRefocus();
                    },
                  },
                ],
              };
              console.log('Garment, warning!!');
              await this.reusableService.playAudio('warning');
              await this.reusableService.showAlert(alert);
              break;
            } else {
              size.balance_popp_qty_load = this.dec(size.balance_popp_qty_load);
              this.animateColorTd = item;
              size.current_carton_pcs++;
              console.log('Increasing of the unknown garment size');
            }
          } else {
            if (
              size.balance_packed == 0 &&
              size.balance_popp_qty_load > 0
              // &&
              // size.current_carton_pcs == size.max_capacity // to have the alert only once
            ) {
              this.showAlertMaxcapacity(size, inc);
              break;
            } else if (
              size.balance_packed > 0 &&
              size.balance_popp_qty_load > 0
            ) {
              this.scrollTop(inc);
              this.animateColorTd = item;
              size.balance_packed = this.dec(size.balance_packed);
              size.balance_popp_qty_load = this.dec(size.balance_popp_qty_load);
              size.current_carton_pcs++;

              await this.clearAndRefocus();
              await this.reusableService.playAudio('correct');
              this.isScanReady = true;
              break;
            }
            // else if (
            //   (size.current_carton_pcs > 0, size.balance_popp_qty_load == 0)
            // ) {
            //   this.isScanReady = false;
            //   let alert = {
            //     header: '🔴 No more Polypack',
            //     msg: `PO polypacked limit reached for size ${size.size}!!!`,
            //     btn: [
            //       {
            //         text: 'OK',
            //         role: 'confirm',
            //         func: async () => {
            //           await this.clearAndRefocus();
            //         },
            //       },
            //     ],
            //   };
            //   await this.reusableService.playAudio('warning');
            //   await this.reusableService.showAlert(alert);
            // }
            break;
          }
        }
        if (size[ 'max_capacity' ] > 0 || size[ 'current_carton_pcs' ] > 0) inc++;
        console.log(item.current_carton_pcs, 'current_carton_pcs pack');
        console.log(item.balance_packed, 'balance_packed');
      }
    }

    //flags
    this.isColorSelect = true;
    this.isPoSelect = true;

    console.log(this.garmentUpdateList);
    console.log(this.garmentBarCodeDataArr);
  }



  async showAlertMaxcapacity(size: any, inc?: any) {
    this.animateColorTd = {};
    this.scrollTop(inc);
    this.isScanReady = false;
    let alert = {
      header: '❗️ Max capacity reached',
      msg: 'Do you want to continue?',
      btn: [
        {
          text: 'Cancel',
          role: 'confirm',
          func: () => {
            this.clearAndRefocus();
            return;
          },
        },
        {
          text: 'Yes',
          role: 'confirm',
          func: () => {
            size.current_carton_pcs++;
            size.balance_popp_qty_load = this.dec(
              size.balance_popp_qty_load
            );
            this.clearAndRefocus();
          },
        },
      ],
    };
    console.log('max, warning!!');
    await this.reusableService.showAlert(alert);
    await this.reusableService.playAudio('warning');

  }






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
    if (action == 'cartonBox') {
      // NOTE : this concept is taken down for now, may be we might or might not provide this
      //will go the backend after getting some remarks on why it is being removed
      let params = {
        path: 'cartonpacking_scan/cartonpackingmultipleremove',
        ponumber: this.poModel[ 'order_ponumber' ],
        cartonbox_qrcode_seq_num:
          this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
        cartonbox_header_seq_num:
          this.cartonBoxQrDetails.cartonbox_header_seq_num,
        sizes: JSON.stringify(this.garmentRawList),
      };

      // await this.dataService.postService(params).then((res: any) => {
      //   if (res[ 'status' ].toLowerCase() == 'success') {
      //     let toast = {
      //       message: 'All the contents removed successfully',
      //       color: 'danger',
      //     };
      //     this.reusableService.showToast(toast);
      //   }
      // });
      return;
    }

    if (action == 'garment') {
      if (size.current_carton_pcs > 0) {

        //frontend remove alone no need to call api as we are not saving on every scan
        // let params = {
        //   path: 'cartonpacking_scan/cartonpackingremove',
        //   ponumber: this.poModel[ 'order_ponumber' ],
        //   cartonbox_qrcode_seq_num:
        //     this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
        //   cartonbox_header_seq_num:
        //     this.cartonBoxQrDetails.cartonbox_header_seq_num,
        //   size_seq_num: size.size_seq_num,
        // };

        // await this.dataService.postService(params).then((res: any) => {

        //   if (res['status'].toLowerCase() == 'success') {
        //     let toast = {
        //       message: 'Removed Successfully',
        //       color: 'dark',
        //     };
        //     this.reusableService.showToast(toast);
        //   }
        // });
        let toastmsg = ''

        if (size.remove_qty_count && !(size.removed_data == size.remove_qty_count)) { //if the remove becomes zero after adding pcs then this will not run
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
          message: toastmsg || 'Removed Successfully',
          color: 'dark',
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
        this.setFocus();
      }, 600);
    }
  }

  // cartonpacking inspection scan funcs
  setInspType(action: string) {
    this.isInspection = true;
    if (action == 'remove') {
      console.log(this.alterInspection, 'remove type');
      // we will be calling the removeRemamrksList service here
      let params = {
        path: 'cartonpacking_scan/getcartonpacking_remark_list',
      };

      this.dataService.postService(params).then((res: any) => {
        if (res[ 'status' ].toLowerCase() == 'success') {
          this.remarkList = res[ 'Remarklist' ];
        }
      });

    } else if (action == 'add') {
      this.alterInspection = true;
      console.log(this.alterInspection, 'add type');
      // we will be calling the addRemamrksList service here if it exists...
      //flags for add
    }
  }

  async confirmRemovePcs() {
    this.isValidBarcode();

    //to check for size_pcs in the box
    for (let item of this.garmentUpdateList) {
      for (let size of item[ 'sizes' ]) {
        if (size.barcode_data == this.garmentBarcodeData) {
          if (size.current_carton_pcs > 0) {
            this.isModalOpen = true; // this will open the modal for remarks and submission of the same
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
            return;
          }
        }
      }
    }
  }

  async removePcsScan() {
    console.log('removing scan with remarks', this.remarkModel);
    this.sizeToRemove[ 'remarks' ] = this.remarkModel.remarks;
    this.sizeToRemove[ 'remarks_seq_num' ] = this.remarkModel.remarks_seq_num;
    let params = {
      path: 'cartonpacking_scan/cartonpacking_alter_remove', //remove service here
      cartonbox_qrcode_seq_num:
        this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      cartonbox_header_seq_num:
        this.cartonBoxQrDetails.cartonbox_header_seq_num,
      cartonpacking_status: this.isPacked,
      color_seq_num: this.colorModel[ 'color_seq_num' ],
      ponumber: this.poModel[ 'order_ponumber' ],
      remove_piece: JSON.stringify(this.sizeToRemove)
    };

    this.dataService.postService(params).then(async (res: any) => {
      if (res[ 'status' ].toLowerCase() == 'success') {
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

  async addPcsScan() {
    let barcode = this.garmentBarcodeData;
    let sizeObj: any = '';
    this.isValidBarcode();

    // to get the size checked in the alter table for any removed pieces remaining
    for (let item of this.garmentUpdateList) {
      for (let size of item[ 'sizes' ]) {
        if (size.barcode_data == barcode) {
          let inc = 0;
          // sizeObj = size; //if we call api
          if (size.remove_qty_count > 0) {
            this.animateColorTd = item;
            // if (size.balance_packed == 0) await this.showAlertMaxcapacity(size, inc);
            if (
              size.balance_packed == 0 &&
              size.balance_popp_qty_load > 0
            ) {
              this.animateColorTd = {};
              this.scrollTop(inc);
              this.isScanReady = false;
              let alert = {
                header: '❗️ Max capacity reached',
                msg: 'Do you want to continue?',
                btn: [
                  {
                    text: 'Cancel',
                    role: 'confirm',
                    func: () => {
                      this.clearAndRefocus();
                      return;
                    },
                  },
                  {
                    text: 'Yes',
                    role: 'confirm',
                    func: () => {
                      size[ 'current_carton_pcs' ]++;
                      size[ 'balance_packed' ] = this.dec(size[ 'balance_packed' ]);
                      size[ 'remove_qty_count' ] = this.dec(size[ 'remove_qty_count' ]);
                      this.pcsAdded = true;
                      this.clearAndRefocus();
                    },
                  },
                ],
              };
              console.log('max, warning!!');
              await this.reusableService.showAlert(alert);
              await this.reusableService.playAudio('warning');
              break;
            }
            size[ 'current_carton_pcs' ]++;
            size[ 'balance_packed' ] = this.dec(size[ 'balance_packed' ]);
            size[ 'remove_qty_count' ] = this.dec(size[ 'remove_qty_count' ]); // to decrease the remove_qty_count

            this.clearAndRefocus();
          }
          else {
            this.addScan(barcode);
          }
          this.pcsAdded = true;
        }
        console.log('size_barcodeData found for removal', size.barcode_data);
        console.log('size found for removal', size);
      }
    }
  }

  // Submit functions common for cartonpacking and cartonpacking_inspection
  canClose() {
    let alertmsg = '';
    // if (this.unpackedSize) {
    //   alertmsg = `${this.unpackedSize.size} is not packed yet,`;
    // }
    // else if (this.totalPiecesLoaded < this.totalPieces) {
    if (this.totalPiecesLoaded < this.totalPieces) {
      alertmsg = `Box Qty ${this.totalPiecesLoaded} is lesser than Total Qty ${this.totalPieces},`;
    } else if (this.totalPiecesLoaded > this.totalPieces) {
      alertmsg = `Box Qty ${this.totalPiecesLoaded} is more than Total Qty ${this.totalPieces},`;
    }
    else {
      alertmsg = ''
    }

    let alert = {
      msg: alertmsg + 'Do you want to submit?',
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

  onSubmit() {
    let params = {
      path: 'cartonpacking_scan/save_scanned_sizes',
      cartonbox_qrcode_seq_num:
        this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      cartonbox_header_seq_num:
        this.cartonBoxQrDetails.cartonbox_header_seq_num,
      ponumber: this.poModel[ 'order_ponumber' ],
      cartonpacking_status: this.isPacked,
      garmentpacking: JSON.stringify(this.garmentUpdateList),
    };
    this.dataService.postService(params).then((res: any) => {
      if (res[ 'status' ].toLowerCase() == 'success') {
        if (this.isPacked == 'S') {
          let toast = {
            message: '☑️ Carton Box Updated!',
            color: 'success',
            position: 'top',
          };

          this.reusableService.showToast(toast);
          this.liveQuantityCheck();

          this.isClosed = true;
          this.pcsAdded = false;
          return;
        }
        let toast = {
          message: 'Carton Box Saved!',
          color: 'success',
          position: 'top',
        };

        // this.reusableService.showToast(toast);
        this.liveQuantityCheck();
        this.onClose();
      }
    });
    console.log('this is submitted', this.garmentUpdateList);
  }

  onClose() {
    let params = {
      path: 'cartonpacking_scan/carton_box_close',
      cartonbox_qrcode_seq_num:
        this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      cartonbox_header_seq_num:
        this.cartonBoxQrDetails.cartonbox_header_seq_num,
      ponumber: this.poModel[ 'order_ponumber' ],
    };
    this.dataService.postService(params).then(async (res: any) => {
      if (res[ 'status' ].toLowerCase() == 'success') {
        let toast = {
          message: '☑️ Carton Box packed!',
          color: 'success',
          position: 'top',
        };

        await this.reusableService.showToast(toast);

        this.isPoSelect = false;
        this.isClosed = true;
        this.animateColorTd = {};
        this.colorList = [];
      }
    });
  }

  // Modal funcs:
  async closeModal() {
    //flags
    await this.modal.dismiss();
    this.isModalOpen = false;
    this.remarkModel = ''
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
          this.animateColorTd = '';
        }, 500);
        this.isPacked == 'S' ?
          this.alterInspection ? this.addPcsScan() : this.confirmRemovePcs()
          : this.addScan();
        // this.garmentBarcodeData = ""; //check this once
      });
  }

  onGarmentInput(event: any) {
    const value = event.detail.value.trim();
    this.garmentInputSubject.next(value);
  }

  //reusable func:
  cumTotalCartonPcs() {
    this.totalPiecesLoaded = 0;

    for (let item of this.garmentUpdateList) {
      for (let size of item[ 'sizes' ]) {
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
      ponumber: this.poModel[ 'order_ponumber' ],
      cartonbox_qrcode: this.cartonBoxQrDetails.qrcode_format,
      cartonbox_header_seq_num:
        this.cartonBoxQrDetails.cartonbox_header_seq_num,
      cartonbox_qrcode_seq_num:
        this.cartonBoxQrDetails.cartonbox_qrcode_seq_num,
      cartonpacking_status: this.isPacked,

    };

    console.log('cartonbox', this.cartonBoxQrDetails.qrcode_format);
    this.showLoading();
    this.dataService.postService(params).then((res: any) => {
      if (
        res[ 'status' ].toLowerCase() == 'success' &&
        this.garmentUpdateList.length > 0
      ) {
        this.garmentRawList = res[ 'garmentpacking' ];
        let abspacked = res[ 'garmentpacking' ];

        for (const colorgrp of this.garmentUpdateList) {
          let sameColor = abspacked.find(
            (ele: any) => ele.color == colorgrp.color
          );
          if (!sameColor) continue;

          for (const size of colorgrp[ 'sizes' ]) {
            let sameSize = sameColor.sizes.find(
              (ele: any) => ele.size_seq_num == size.size_seq_num
            );
            if (size[ 'size_seq_num' ] == sameSize[ 'size_seq_num' ]) {
              for (const estQty of this.accomodateSizeQty) {
                if (size.size_seq_num == estQty.size_seq_num) {
                  size[ 'max_capacity' ] = estQty.sizeQty;
                  console.log('maxcapacity', size[ 'max_capacity' ]);
                  break;
                }
              }
              size[ 'balance_packed' ] = Math.max(
                0,
                +size[ 'max_capacity' ] - +size[ 'current_carton_pcs' ]
              );
              size[ 'poqty_packed' ] = sameSize[ 'poqty_packed' ];
              size[ 'current_carton_pcs' ] = +sameSize[ 'current_carton_pcs' ];
              size[ 'balance_popp_qty_load' ] =
                +sameSize[ 'balance_popp_qty_load' ];
              size[ 'remove_qty_count' ] = +sameSize[ 'remove_qty_count' ]
            }
          }
        }
        this.cumTotalCartonPcs();
      }
      this.cancelLoading();
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
    if (
      !this.garmentBarCodeDataArr.includes(this.garmentBarcodeData) ||
      this.garmentBarcodeData == ''
    ) {
      let barcode = this.garmentBarcodeData || '--';
      this.reusableService.playAudio('warning');
      console.error('Not a valid barcode for this data');
      console.log(this.garmentBarCodeDataArr, this.garmentBarcodeData);
      this.garmentBarcodeData = '';
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
  }

  async canLeave() {
    let isLeave = this.garmentUpdateList.some((item: any) => {
      return item[ 'sizes' ].some((size: any) => size.current_carton_pcs > 0);
    });

    if (
      (isLeave &&
        this.isPoSelect &&
        this.isPacked != 'S') || this.pcsAdded
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
  }
}
