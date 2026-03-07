import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage-service';
// import { Network } from '@capacitor/network';

import {
  BarcodeFormat,
  BarcodeScanner,
} from '@capacitor-mlkit/barcode-scanning';
import { ReusableService } from '../reusables/reusable-service';
import { BehaviorSubject } from 'rxjs';
import { NavController } from '@ionic/angular';

// app_type
// Check panel = PC
// ELC = Q
// Polypack = PP
// Cartonpack = CP

export type APP_TYPE = 'PC' | 'Q' | 'PP' | 'CP';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  tracerArr: any = [];

  ip = this.storageService.getData('ip') || '';

  ipAdd = this.ip == 'localip' ? 'http://192.168.16.127/gannet_v5/' : this.ip; //temp only for debugging

  public apiUrl: string = `https://${this.ipAdd}/` // Live url
  // public apiUrl: string = 'http://192.168.16.127/gannet_v5/'; // Local url

  // **NOTE** : NOT IN USE DUE TO FACTORY SECURITY REASONS AND WIFI DISRUPTIONS
  // public apiUrl: string = 'https://apps.whitehouseit.com/carton/'; //Staging url
  //  public apiUrl: string = 'https://gannet.online/console/'; // Live url 

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private reusableService: ReusableService,
    private navCtrl: NavController
  ) {
  }

  async postService(params: any) {
    try {
      await this.reusableService.cancelLoading();
    } catch (error) {

    }
    // setTimeout(() => {
    //   this.reusableService.showLoading();
    // }, 500);

    await this.reusableService.showLoading();

    let userData = this.storageService.getData('userData');
    let uinno = userData.uinno;
    let app_type: APP_TYPE = this.storageService.getData('app_type');
    let qc_device_details = this.storageService.getData('qc_device_details'); //will have the tab device details itseems
    let rfid = this.storageService.getData('rfid_operator')

    // temp try but didn't work
    // if (this.apiUrl == `https://${this.ipAdd}/pdkgannet.whindia.in/`) {
    //   let path = '';
    //   let data = params.path.split('/')[0];
    //   if (app_type == 'PP') {
    //     path = 'apppolypack/controllers/';
    //   } else if (app_type == 'CP') {
    //     path = 'appcartonpack/controllers/';
    //   }
    //   params.path = path + params.path + '.php'
    // } else {
    //   console.log('local api, params:', params);
    // }

    let postData = new FormData();


    if (userData) {
      postData.append('key', 'MTAwMCMjTEtNSiMjMTc1ODI2NjM5MDQ4OTAwMA==');
      postData.append('createdip', '111');
      postData.append('userid', userData.user_id);
      postData.append('companyshortname', userData.companyshortname);
      postData.append('processseqnum', '1');
      postData.append('locationseqnum', userData.branchcode);
      postData.append('qc_device_details', JSON.stringify(qc_device_details));
      postData.append('app_type', app_type);
      postData.append('uinno', uinno);
      postData.append('rfid', rfid); //discuss on this (rfid for operator?, supervisor?)
    }

    for (var q in params) {
      postData.append(q, params[q]);
    }

    setTimeout(async () => {
      try {
        await this.reusableService.cancelLoading();
      } catch (error) {

      }
    }, 10000);

    return new Promise(async (resolve, reject) => {
      // if (!navigator.onLine) {
      //   let alert = {
      //     header: '🚫 Offline',
      //     msg: 'Please Connect to the Internet and then try again!',
      //     btn: {
      //       text: 'OK',
      //       role: 'cancel',
      //       func: (): any => {
      //         setTimeout(() => {
      //           if (!navigator.onLine) return console.log('offline still');
      //         }, 5000);
      //       },
      //     },
      //   };
      //   await this.reusableService.showAlert(alert);
      // }

      this.http.post(this.apiUrl + params['path'].trim(), postData).subscribe(
        async (res) => {
          await this.reusableService.cancelLoading();
          resolve(res);
          // this.tracerArr.push(res);
        },
        (err) => {
          let alert = {
            header: err.status > 0 ? '⚠️Error' : '🚫 Offline',
            subHeader: err.status > 0 ? `Status code: ${err.status}` : '',
            msg:
              err.status > 0
                ? err.message
                : 'Please Connect to the Internet and then try again',
          };

          this.reusableService.cancelLoading();
          this.reusableService.showAlert(alert);
          console.log(err);
          reject(err);
        }
      );
    });
  }

  //only for admin
  branchService(params: any) {
    let postData = new FormData();

    let userData = this.storageService.getData('userData');

    if (userData) {
      postData.append('key', 'MTAwMCMjTEtNSiMjMTc1ODI2NjM5MDQ4OTAwMA==');
      postData.append('createdip', '111');
      postData.append('userid', userData.user_id);
      postData.append('companyshortname', userData.companyshortname);
      postData.append('processseqnum', '1');
    }

    return new Promise(async (resolve, reject) => {
      this.http.post('https://gannet.online/console/' + params['path'].trim(), postData).subscribe(
        (res) => {
          resolve(res);
          // this.tracerArr.push(res);
        },
        (err) => {
          let alert = {
            header: err.status > 0 ? '⚠️Error' : '🚫 Offline',
            subHeader: err.status > 0 ? `Status code: ${err.status}` : '',
            msg:
              err.status > 0
                ? err.message
                : 'Please Connect to the Internet and then try again',
          };
          this.reusableService.cancelLoading();
          this.reusableService.showAlert(alert);
          console.log(err);
          reject(err);
        }
      );
    });
  }

  //APP_TYPE opened
  async app_typeService() {
    try {
      await this.reusableService.cancelLoading();
    } catch (error) {

    }
    // setTimeout(() => {
    //   this.reusableService.showLoading();
    // }, 500);

    await this.reusableService.showLoading();

    let postData = new FormData();

    let userData = this.storageService.getData('userData');
    let ip = this.storageService.getData('ip');
    let app_type: APP_TYPE = this.storageService.getData('app_type');
    let qc_device_details = this.storageService.getData('qc_device_details');

    if (userData) {
      postData.append('key', 'MTAwMCMjTEtNSiMjMTc1ODI2NjM5MDQ4OTAwMA==');
      postData.append('createdip', '111');
      postData.append('userid', userData.user_id);
      postData.append('companyshortname', userData.companyshortname);
      postData.append('processseqnum', '1');
      postData.append('locationseqnum', userData.branchcode);
      postData.append('qc_device_details', qc_device_details);
      postData.append('app_type', app_type);
      postData.append('ip', ip);
    }

    return new Promise(async (resolve, reject) => {

      this.http.post('https://gannet.online/console/login/getapp_type', postData).subscribe(
        async (res) => {
          resolve(res);
          // this.tracerArr.push(res);
        },
        (err) => {
          let alert = {
            header: err.status > 0 ? '⚠️Error' : '🚫 Offline',
            subHeader: err.status > 0 ? `Status code: ${err.status}` : '',
            msg:
              err.status > 0
                ? err.message
                : 'Please Connect to the Internet and then try again',
            btn: [
              {
                text: 'OK',
                role: 'confirm',
                func: () => { this.navCtrl.navigateRoot(['/home']) }
              }
            ]
          };

          this.reusableService.showAlert(alert);
          console.log(err);
          reject(err);
        }
      );
    });
  }

  async scanCode() {
    await BarcodeScanner.requestPermissions();
    if (!(await BarcodeScanner.isSupported())) {
      let toast = {
        message: 'Scanner not supported!!',
        color: 'danger',
        dur: 4000,
      };
      this.reusableService.showToast(toast);
      return 'Scanner error';
    }
    const { barcodes } = await BarcodeScanner.scan({
      formats: [
        BarcodeFormat.Code128,
        BarcodeFormat.Code39,
        BarcodeFormat.Code93,
        BarcodeFormat.Codabar,
        BarcodeFormat.DataMatrix,
        BarcodeFormat.Ean13,
        BarcodeFormat.Ean8,
        BarcodeFormat.Itf,
        BarcodeFormat.QrCode,
        BarcodeFormat.UpcA,
        BarcodeFormat.UpcE,
        BarcodeFormat.Pdf417,
        BarcodeFormat.Aztec,
      ],
    });
    if (barcodes.length) {
      console.log(barcodes);
      let data = barcodes[0]['displayValue'];
      if (!data) {
        console.log('Error in fetching data', data);
        return null;
      }
      console.log('capacitor scanned barcode', data);
      return data;
    } else {
      let toast = {
        message: 'Error in scanning try again!!',
        color: 'warning',
        dur: 4000,
      };
      this.reusableService.showToast(toast);
      return null;
    }
  }

  checkRfid() {
    console.log('to convert rfid')
  }
}
