import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  IonicModule,
  IonInput,
  ModalController,
  NavController,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { StorageService } from '../../providers/storage/storage-service';
import { ReusableService } from '../../providers/reusables/reusable-service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-rfid-login-modal',
  templateUrl: './rfid-login-modal.component.html',
  styleUrls: ['./rfid-login-modal.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RfidLoginModalComponent implements OnInit, AfterViewInit {
  rfid: any = '';
  operatorId: any = '';
  @ViewChild('scanInput', { static: false }) scanInput!: IonInput;
  private rfidInputSubject = new Subject<string>();
  private inputSub: any;
  constructor(
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private reusableService: ReusableService,
    private navCtrl: NavController,
  ) {}
  ngOnInit() {
    this.rfid = this.storageService.getData('rfid') || '';
  }

  addNumber(num: string) {
    this.operatorId += num;
  }

  delete() {
    this.operatorId = this.operatorId.slice(0, -1);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.scanInput.setFocus();
    }, 300);
  }

  keepScannerFocus() {
    setTimeout(() => {
      this.scanInput.setFocus();
    }, 50);
  }

  convertRFID() {
    let value = this.operatorId;
    let hex = Number(value).toString(16);
    hex = hex.slice(-4);
    let rfid = parseInt(hex, 16);

    let convertId = rfid; // converted id
    console.log(this.operatorId);
    if (this.operatorId) {
      console.log('Scanned and converted id', this.operatorId, convertId);
      return convertId;
    } else {
      console.log('scan failed');
      let toast = {
        msg: 'Scan failed try again',
        color: 'danger',
      };

      this.reusableService.showToast(toast);
      return null;
    }
  }

  isCheckOut: boolean = false;
  canSubmit() {
    let new_id = this.convertRFID(); // to convert the scanned value

    if (!this.rfid) {
      return this.checkIn(new_id); //scanned value to be set in storage for apis
    }

    if (this.rfid.operator_rfid !== new_id) {
      return this.showToast(`${this.operatorId} is not checked in`, 'danger');
    }

    this.checkOut();
    console.debug(this.rfid);
  }

  checkIn(id: any) {
    this.rfid = { operator_rfid: id, operator: this.operatorId };
    this.storageService.setData('rfid', this.rfid);

    this.showToast(`${this.operatorId} has been checked in`, 'success');

    setTimeout(() => {
      this.submit();
    }, 300);
  }

  checkOut() {
    this.isCheckOut = true;
    this.rfid = this.storageService.getData('rfid');
    let id = this.rfid.operator; // operator typed id
    this.rfid.operator = null;
    this.rfid.operator_rfid = null;

    this.storageService.setData('rfid', this.rfid);

    this.showToast(`${id} has been checked out`, 'warning');

    const data = this.storageService.getData('rfid');

    if (!data.operator) {
      this.navCtrl.back();

      setTimeout(() => {
        this.submit('checkout');
      }, 300);
    } else {
      this.showToast(`Error in checking out try again!!`, 'danger');
    }
  }

  submit(action?: string) {
    this.modalCtrl.dismiss();

    this.convertRFID(); //to convert and send to api?

    // to have multiple id (supervisor,operator,admin)

    // api call?
    let params = {
      path: '',
      rfid: this.rfid.operator_rfid,
    };
  }

  close() {
    this.modalCtrl.dismiss();
  }

  // scanner works
  ngAfterViewInit(): void {
    this.inputSub = this.rfidInputSubject
      .pipe(debounceTime(500))
      .subscribe((val: any) => {
        this.operatorId = val;
        this.canSubmit();
      });
  }

  onRfidInput(event: any, isBut?) {
    const value = isBut ? this.operatorId : event.detail.value;
    console.log('cartonInput is triggered', value);
    if (value) this.rfidInputSubject.next(value); //need to check this
    this.rfidInputSubject.next(value);
  }

  // reusable
  async showToast(msg: string, color: string) {
    await this.reusableService.showToast({
      message: msg,
      color: color,
      position: 'top',
    });
  }

  ngOnDestroy() {
    if (this.inputSub) {
      this.inputSub.unsubscribe();
      this.rfidInputSubject.unsubscribe();
    }
  }
}
