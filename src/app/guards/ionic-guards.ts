import { inject, Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ReusableService } from '../providers/reusables/reusable-service';

@Injectable({
  providedIn: 'root',
})
export class IonicGuards {
  navCtrl = inject(NavController);
  reusableService = inject(ReusableService);

  async canLeave(hasChanges: boolean, func?: any, route?: string) {
    if (hasChanges) {
      let alert = {
        header: '⚠️ Alert',
        msg: 'Do you want to leave this page?',
        // msg: 'Please submit the changes before leaving this page?',
        btn: [
          {
            text: 'OK',
            role: 'confirm',
            func: () => {
              this.navCtrl.back();
              console.log('Leaving the page on user\'s request');
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
            func: () => {
              console.log('Staying in the same page to save the changes');
            },
          },
        ],
      };
      await this.reusableService.showAlert(alert);
    }
    else {
      this.navCtrl.back();
    }
  }
}
