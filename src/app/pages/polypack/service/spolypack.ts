import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../../../providers/dataService/data-service';

@Injectable({
  providedIn: 'root',
})
export class Spolypack {

  constructor(private dataService: DataService) {

  }

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

  changeApiPolypack(api: string) {
    let apiGlobal = this.dataService.apiUrl;
    let apiChanges = api.split('/')[1];

    if (apiGlobal == 'https://pdkgannet.whindia.in/') {
      apiChanges = 'apppolypack/controllers/' + apiChanges + '.php';
    } else {
      return apiChanges = api
    }
    console.warn('apiChanges', apiChanges)
    return apiChanges;
  }
}
