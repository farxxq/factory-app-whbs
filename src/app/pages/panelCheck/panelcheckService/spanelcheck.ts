import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Spanelcheck {
  private filterListData = new BehaviorSubject<any>(null);
  filterListData$ = this.filterListData.asObservable();

  sendListData(val: any) {
    this.filterListData.next(val);
  }

  getListData() {
    return this.filterListData.getValue();
  }

  handleActions(action: string, data?: any) {
    switch (action) {
      case 'completeBundle':
        this.completeBundle(data);
        break;
      case 'rejectPanel':
        this.rejectPanel(data);
        break;
      case 'closeLaycut':
        this.closeLaycut(data);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  closeLaycut(data: any) {
    throw new Error('Method not implemented.');
  }
  rejectPanel(data: any) {
    throw new Error('Method not implemented.');
  }
  completeBundle(data: any) {
    throw new Error('Method not implemented.');
  }
}
