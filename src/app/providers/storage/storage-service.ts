import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setData(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
    console.log('Data set to local Storage');
  }

  getData(key: string) {
    const data = localStorage.getItem(key);
    if (typeof data == 'string') {
      const localData = data ? JSON.parse(data) : null;
      // console.log(key, localData);
      return localData;
    }
  }

  removeData(key: string) {
    const remData = localStorage.removeItem(key);
    console.log('Data removed from localStorage:', remData);
  }
}
