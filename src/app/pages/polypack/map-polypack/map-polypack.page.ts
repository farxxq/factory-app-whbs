import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../providers/dataService/data-service';
import { ReusableService } from '../../../providers/reusables/reusable-service';
import { Spolypack } from '../service/spolypack';
import { IonInput, NavController } from '@ionic/angular';
import { debounceTime, Subject } from 'rxjs';
import { IonicGuards } from 'src/app/guards/ionic-guards';
import { StorageService } from 'src/app/providers/storage/storage-service';

@Component({
  selector: 'app-map-polypack',
  templateUrl: './map-polypack.page.html',
  styleUrls: [
    './map-polypack.page.scss',
    '../polypack-master/polypack-master.page.scss',
  ],
  standalone: false,
})
export class MapPolypackPage implements OnInit {
  deviceType: any = '';
  qrCode: any = '';

  colorList: any = [];
  colorModel: any = '';

  filterDataList: any = [];
  sizeList: any = [];
  scannedMapSizeList: any = [];
  mapInputData: any = '';

  generateList: any = [];
  genColorList: any = [];
  currentGenList: any = [];

  scanBtnF: boolean = true;

  actionType!: string;
  isScanner!: string;

  isGenerated: boolean = false;

  @ViewChild('mapInput', { static: false })
  mapInput!: IonInput;


  private mapInputSubject = new Subject<string>();
  private inputSub: any;

  constructor(
    private reusableService: ReusableService,
    private dataService: DataService,
    private polypackService: Spolypack,
    private navCtrl: NavController,
    private ionicGuards: IonicGuards,
    private storageService: StorageService
  ) {
    this.filterDataList = this.polypackService.getMapData();
    this.deviceType = this.reusableService.deviceType();
    this.isScanner = this.storageService.getData('isScanner');
    console.log(this.filterDataList)
  }

  ngOnInit() {
    this.getColorLists();
    this.actionType = this.filterDataList.actionType;
  }

  async getColorLists() {
    let params = {
      path: 'carton_packing/getcolors',
      orderseqnum: this.filterDataList.order['order_seq_num'],
    };

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.colorList = res['colordetails'];
        this.colorModel = this.filterDataList.color;

        if (this.filterDataList.actionType == 'map') {
          this.mapping();
        }
        console.log(this.colorList, 'colorList');
      } else if (res['status'].toLowerCase() == 'error') {
        let toast = {
          message: res['message'],
          color: 'danger',
        };

        this.reusableService.showToast(toast);
      }
    });
  }

  async mapping() {
    let params = {
      path: 'carton_packing/getsize',
      orderseqnum: this.filterDataList.order['order_seq_num'],
      colorseqnum: this.colorModel['color_seq_num'],
    };

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        //  res['sizedetails'];
        this.sizeList = this.reusableService.rearrangeData(res['sizedetails'], 'size_name')
        this.scannedMapSizeList = JSON.parse(JSON.stringify(this.sizeList));
        console.log(this.scannedMapSizeList, 'initial');
        for (const size of this.scannedMapSizeList) {
          size['mInpF'] = false;
          size['barcodeModel'] = '';
        }
        console.log(this.sizeList, 'sizeList');
      } else if (res['status'].toLowerCase() == 'error') {
        let toast = {
          message: res['message'],
          color: 'danger',
        };

        this.reusableService.showToast(toast);
      }
    });
  }

  async generate() {
    let params = {
      path: 'carton_packing/barcodegenerate',
      seasonseqnum: this.filterDataList.season['season_seq_num'],
      orderseqnum: this.filterDataList.order['order_seq_num'],
      customerseqnum: this.filterDataList.customer['customer_seq_num'],
    };

    this.dataService.postService(params).then(async (res: any) => {
      if (res['status'].toLowerCase() == 'success') {
        this.generateList = res['barcode_details'];
        console.log(res['barcode_details']['colors'][0]['sizes'])
        this.generateList.colors.forEach((color: any) => {
          color.sizes = this.reusableService.rearrangeData(color.sizes, 'size_name');
        });


        this.genColorList = JSON.parse(
          JSON.stringify(this.generateList.colors)
        );

        for (let item of this.genColorList) {
          if (item.color_seq_num == this.colorModel['color_seq_num']) {
            this.currentGenList = item;
          }
        }

        this.isGenerated = this.currentGenList.sizes.some(
          size => size.barcode_type_details
        );

        console.log(this.currentGenList, 'currentGenList')
        console.log(this.genColorList, 'initial');
        console.log(this.generateList, 'generateList');
      } else if (res['status'].toLowerCase() == 'error') {
        let toast = {
          message: res['message'],
          color: 'danger',
        };

        this.reusableService.showToast(toast);
      }
    });
  }

  async scanCode(index: number) {
    let data = await this.dataService.scanCode();
    // let data = 'GDC-2016-3773-337-237';
    if (!data) {
      return console.log('Scan again no data retreived', data);
    }

    let isPresent = this.scannedMapSizeList.find(
      (size: any) => size.barcode_type_details == data
    );

    console.log(isPresent);

    if (isPresent) {
      let alert = {
        header: '⚠️ Code Scanned!',
        msg: 'Same code scanned already'
      };

      this.reusableService.showAlert(alert);
      return;
    }

    this.scannedMapSizeList[index]['barcode_type_details'] = data;

    console.log(this.sizeList, 'before');
    console.log(this.scannedMapSizeList, 'after');
  }

  async confirmSubmit(action: string) {
    let alert = {
      header: '⚠️ Confirm Submission',
      msg: action == 'Do you want to submit?',
      // msg: action == 'gen'? 'Submit for all colors?' : 'Do you want to submit?',
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
            this.onSubmit(action);
          },
        },
      ],
    };
    await this.reusableService.showAlert(alert);
  }

  async onSubmit(action: string) {
    if (action == 'map') {
      let barcodeDetails = [];
      for (const list of this.scannedMapSizeList) {
        let data = {
          sizeseqnum: list.size_seq_num,
          barcode_type_details: list.barcode_type_details,
          barcode_type: 'M',
        };

        if (data) {
          barcodeDetails.push(data);
        }
      }
      console.log(barcodeDetails, 'barcodeDetails');

      //http post
      let params = {
        path: 'carton_packing/orderdetailsbarcodemapping',
        colorseqnum: this.colorModel['color_seq_num'],
        customerseqnum: this.filterDataList.customer['customer_seq_num'],
        orderseqnum: this.filterDataList.order['order_seq_num'],
        seasonseqnum: this.filterDataList.season['season_seq_num'],
        barcode_mappings: JSON.stringify(barcodeDetails),
      };

      this.dataService.postService(params).then(async (res: any) => {
        let message: string = '';
        let color: string = '';

        if (res['status'].toLowerCase() == 'success') {
          message = res['message'];
          color = 'success';
        } else {
          message = res['message'];
          color = 'danger';
        }

        let toast = {
          message: message,
          color: color,
        };

        this.reusableService.showToast(toast);
      });
    } else if (action == 'gen') {
      let genBarCodeDetails = [];


      let params = {};
      let success: boolean = false;
      let message: string = '';
      let color: string = '';
      for (let i = 0; i < this.colorList.length; i++) {
        for (const item of this.currentGenList.sizes) {
          let data = {
            barcode_type: 'G',
            barcode_type_details: item.barcode_number,
            sizeseqnum: item.size_seq_num,
          };

          genBarCodeDetails.push(data);
        }

        params = {
          path: 'carton_packing/orderdetailsbarcodemapping',
          colorseqnum: this.colorList[i]['color_seq_num'],
          customerseqnum: this.filterDataList.customer['customer_seq_num'],
          orderseqnum: this.filterDataList.order['order_seq_num'],
          seasonseqnum: this.filterDataList.season['season_seq_num'],
          barcode_mappings: JSON.stringify(genBarCodeDetails),
          i: i
        };

        console.log(this.colorList[i]['color_seq_num'],)

        this.dataService.postService(params).then(async (res: any) => {
          if (res['status'].toLowerCase() == 'success') {
            success = true;
            if (i == this.colorList.length - 1) {
              setTimeout(async () => {
                await this.generate();
              }, 1000);
              let toast = {
                message: res['message'],
                color: 'success',
                position: 'middle',
              };

              this.reusableService.showToast(toast);
            }
          }
        });
      }
      //refreshing the list
      // if (success) {
      //   message = 'Generated successfully';
      //   color = 'success';

      // } else {
      //   message = 'Error in generating codes';
      //   color = 'danger';
      // }
      // let toast = {
      //   message: message,
      //   color: color,
      //   position: 'middle',
      // };

      // this.reusableService.showToast(toast);
      //http post
      // let params = {
      //   path: 'carton_packing/orderdetailsbarcodemapping',
      //   colorseqnum: this.colorModel['color_seq_num'],
      //   customerseqnum: this.filterDataList.customer['customer_seq_num'],
      //   orderseqnum: this.filterDataList.order['order_seq_num'],
      //   seasonseqnum: this.filterDataList.season['season_seq_num'],
      //   barcode_mappings: JSON.stringify(genBarCodeDetails),
      // };

      // this.dataService.postService(params).then(async (res: any) => {
      //   let message: string = '';
      //   let color: string = '';

      //   if (res['status'].toLowerCase() == 'success') {
      //     message = res['message'];
      //     color = 'success';

      //     await this.generate(); //refreshing the list
      //   } else {
      //     message = res['message'];
      //     color = 'danger';
      //   }

      //   let toast = {
      //     message: message,
      //     color: color,
      //     position: 'middle',
      //   };

      //   this.reusableService.showToast(toast);
      // });
    }
  }

  setFocus(index?: any) {
    // this.mapInput.setFocus();
    this.scannedMapSizeList[index]['mInpF'] = true;
    console.log('carton box focused', this.scannedMapSizeList[index]);
  }

  ngAfterViewInit(): void {
    this.inputSub = this.mapInputSubject
      .pipe(debounceTime(500))
      .subscribe((val: any) => {
        this.mapInputData = val;

        setTimeout(() => {
          this.mapInputData = '';
        }, 10000);
      });
  }

  onMapInput(event: any, index?: any) {
    const value = event.detail.value;
    console.log('cartonInput is triggered', value);
    let isPresent = this.scannedMapSizeList.find(
      (size: any) => size.barcode_type_details == value
    );
    console.warn(isPresent, 'code already scanned');
    if (isPresent) {
      let alert = {
        header: '⚠️ Code Scanned!',
        msg: 'Same code scanned already',
        btn: [
          {
            text: 'OK',
            role: 'confirm',
            func: () => {
              this.scannedMapSizeList[index]['barcode_type_details'] = null;
              this.scannedMapSizeList[index]['barcodeModel'] = '';
              this.scannedMapSizeList[index]['mInpF'] = false;
            }
          }
        ]
      };
      this.reusableService.showAlert(alert);
      return;
    }
    this.scannedMapSizeList[index]['barcode_type_details'] = value;

    setTimeout(() => {
      this.scannedMapSizeList[index]['barcodeModel'] = '';
      this.scannedMapSizeList[index]['mInpF'] = false;
    }, 2000);
    // if(value) this.cartonInputSubject.next(value); //need to check this
    this.mapInputSubject.next(value);
  }

  async canLeave() {
    let isPresent = false;
    for (let size of this.scannedMapSizeList) {
      if (size.barcode_type_details) isPresent = true;
    }

    let unsavedChanges = false;
    if (isPresent) {
      unsavedChanges = true;
    } else {
      unsavedChanges = false;
    }
    await this.ionicGuards.canLeave(unsavedChanges);
  }
}
