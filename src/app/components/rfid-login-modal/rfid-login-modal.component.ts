import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { StorageService } from '../../providers/storage/storage-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rfid-login-modal',
  templateUrl: './rfid-login-modal.component.html',
  styleUrls: ['./rfid-login-modal.component.scss'],
    imports: [IonicModule, CommonModule, FormsModule],
  
})
export class RfidLoginModalComponent  implements OnInit {
  
  operatorId: string = '';
  constructor(private modalCtrl: ModalController, private storageService: StorageService) {}
  ngOnInit() {}

  addNumber(num: string) {
    this.operatorId += num;
  }

  delete() {
    this.operatorId = this.operatorId.slice(0, -1);
  }

  submit() {
    this.modalCtrl.dismiss(this.operatorId);
    // to have multiple id (supervisor,operator,admin)
    let rfid = {
      operator: this.operatorId
    }
    this.storageService.setData('rfid', rfid);
  }

  close() {
    this.modalCtrl.dismiss();
  }


}
