import { Injectable } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';

import { Platform } from '@ionic/angular';
import { RfidLoginModalComponent } from 'src/app/components/rfid-login-modal/rfid-login-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ReusableService {

  //Loading
  activeLoading: any;
  audio = new Audio();

  isCustomLoading: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadCtrl: LoadingController,
    private modalCtrl: ModalController,
    // private platform: Platform
  ) {}

  deviceType() {
    if (window.innerWidth >= 768) {
      return 'tab';
    } else if (window.innerWidth < 768) {
      return 'mobile';
    }
    return 'unknown';

    //using the platfrm thing
    // if (this.platform.is('tablet')) {
    //   console.log('tablet');
    //   return 'tab';
    // }
    // else if (this.platform.is('mobile')) {
    //   console.log('mobile');
    //   return 'mobile';
    // }
    // else if (this.platform.is('desktop')) {
    //   console.log('desktop');
    //   return 'desktop';
    // }
    // return 'unknown';
  }

  async showAlert(alert: any) {
    const alertPopup = await this.alertCtrl.create({
      header: alert.header || '⚠️ Alert',
      subHeader: alert.subHeader || '',
      message: alert.msg || '',
      buttons: alert.btn
        ? Array.isArray(alert.btn)
          ? alert.btn.map((b) => ({
              text: b.text || 'OK',
              role: b.role || 'cancel',
              handler: b.func
                ? () => b.func()
                : () => {
                    console.log('Alert closed');
                  },
            }))
          : [
              {
                text: alert.btn.text || 'OK',
                role: alert.btn.role || 'cancel',
                handler: alert.btn.func
                  ? () => alert.btn.func()
                  : () => {
                      console.log('Alert closed');
                    },
              },
            ]
        : [{ text: 'OK', role: 'cancel' }],
      cssClass: 'alertBox',
      backdropDismiss: alert.backdropDismiss || false,
    });

    await alertPopup.present();
  }

  async showToast(toast: any) {
    const toastPopup = await this.toastCtrl.create({
      message: toast.message,
      position: toast?.position || 'top',
      duration: toast?.dur || 2000,
      color: toast?.color,
      cssClass: 'toast',
      mode: 'ios',
      keyboardClose: true,
      swipeGesture: 'vertical',
    });
    // cssClass: toast?.cssClass,

    await toastPopup.present();
  }

  async showLoading(loader?: any) {
    // this.activeLoading = await this.loadCtrl.create({
    //   message: loader?.message,
    //   spinner: loader?.spinner || 'crescent',
    //   duration: loader?.duration,
    //   mode: 'ios',
    // });

    // await this.activeLoading.present();
    this.isCustomLoading = true;
    console.log('active loading');
  }

  async cancelLoading() {
    // if (this.activeLoading) {
    //   await this.activeLoading.dismiss();
    //   this.activeLoading = null;
    //   console.log('loading ended');
    // }

    this.isCustomLoading = false;
  }

  async playAudio(audioType: string) {
    let path = '';
    if (audioType == 'correct') {
      path = '../../../assets/audio/correct.mp3';
      console.log('correct sound');
    } else if (audioType == 'warning') {
      path = '../../../assets/audio/wrong.mp3';
      console.log('warning sound');
    } else {
      console.log('danger kinda...');
    }

    this.audio.src = path;
    this.audio.load();
    await this.audio.play();
    console.log('audio played');
  }
  async stopAudio() {
    await this.audio.pause();
    console.log('audio paused');
  }

  rearrangeData(arr: any, key?: string) {
    let rearrangeData = arr;
    // console.log('rearrangeData from reusable', rearrangeData)
    if (rearrangeData) {
      rearrangeData.sort((obj1: any, obj2: any) =>
        obj1[key].localeCompare(obj2[key], undefined, { numeric: true }),
      );
      if (rearrangeData.length > 0) return rearrangeData;
    } else {
      return console.log('rearrange data is empty');
    }
  }

  //operator login
  async loginOperator() {
    const modal = await this.modalCtrl.create({
      component: RfidLoginModalComponent,
      cssClass: 'operator-login-modal',
      backdropDismiss: false,
    });

    await modal.present();
  }
}
