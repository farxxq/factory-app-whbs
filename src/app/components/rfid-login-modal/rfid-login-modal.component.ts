import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonInput, ModalController } from '@ionic/angular';
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
  operatorId: any = '';
  @ViewChild('scanInput', { static: false }) scanInput!: IonInput;
    private rfidInputSubject = new Subject<string>();
    private inputSub: any;
  constructor(
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private reusableService: ReusableService,
  ) {}
  ngOnInit() {}

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

  convertRFID(scanValue?: string) {
    let value = scanValue ? scanValue : this.operatorId;
    let hex = Number(value).toString(16);
    hex = hex.slice(-4);
    let rfid = parseInt(hex, 16);

    this.operatorId = rfid;
    console.log(this.operatorId);
    if (this.operatorId) {
      console.log('Scanned and converted id', this.operatorId)
    } else {
      console.log('scan failed');
      let toast = {
        msg: 'Scan failed try again',
        color: 'danger',
      };

      this.reusableService.showToast(toast);
    }
  }

  submit() {
    this.modalCtrl.dismiss();
    
    this.convertRFID(); //to convert and send to api?

    // to have multiple id (supervisor,operator,admin)
    let rfid = {
      operator: this.operatorId,
    };
    this.storageService.setData('rfid', rfid);

    // api call?
    let params = {
      path: '',
      rfid: rfid.operator
    }
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
          this.submit();
        });
    }
  
    onRfidInput(event: any, isBut?) {
      const value = isBut ? this.operatorId : event.detail.value;
      console.log('cartonInput is triggered', value);
      if(value) this.rfidInputSubject.next(value); //need to check this
      this.rfidInputSubject.next(value);
    }
  
    ngOnDestroy() {
      if (this.inputSub) {
        this.inputSub.unsubscribe();
        this.rfidInputSubject.unsubscribe();
      }
    }
}
