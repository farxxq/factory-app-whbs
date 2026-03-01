import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { ReusableService } from './providers/reusables/reusable-service';
import { DataService } from './providers/dataService/data-service';

register(); //for swiper js

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: [ 'app.component.scss' ],
  standalone: false,
})
export class AppComponent {
  constructor(public reusableService: ReusableService,
    private dataService: DataService) {
    if (!navigator.onLine) {
      let alert = {
        header: '🚫 Offline',
        msg: 'Please Connect to the Internet and then try again!',
        btn: {
          text: 'OK',
          role: 'cancel',
          func: (): any => {
            setTimeout(() => {
              if (!navigator.onLine) return console.log('offline still');
            }, 5000);
          },
        },
      };
      this.reusableService.showAlert(alert);
    }

    alert('Version inspection');
    alert(this.dataService.apiUrl);
  }

}
