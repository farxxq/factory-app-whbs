import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Spolypack {

  private filterAddData = new BehaviorSubject<any>(null);
  filterAddData$ = this.filterAddData.asObservable();

  private filterListData = new BehaviorSubject<any>(null);
  filterListData$ = this.filterListData.asObservable();

  private filterMapData = new BehaviorSubject<any>(null);
  filterMapData$ = this.filterMapData.asObservable();

  sendAddData(val: any) {
    this.filterAddData.next(val);
  }

  getAddData() {
    return this.filterAddData.getValue();
  }

  sendListData(val: any) {
    this.filterListData.next(val);
  }

  getListData() {
    return this.filterListData.getValue();
  }

  sendMapData(val: any) {
    this.filterMapData.next(val);
  }

  getMapData() {
    return this.filterMapData.getValue();
  }
}
