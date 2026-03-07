import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../providers/authService/auth-service';
import { DataService } from '../../../providers/dataService/data-service';
import { StorageService } from '../../../providers/storage/storage-service';
import { ReusableService } from 'src/app/providers/reusables/reusable-service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
