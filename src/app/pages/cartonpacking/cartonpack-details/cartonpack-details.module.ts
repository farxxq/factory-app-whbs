import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartonpackDetailsPageRoutingModule } from './cartonpack-details-routing.module';

import { CartonpackDetailsPage } from './cartonpack-details.page';
import { Select } from 'primeng/select';
import { HeaderComponent } from '../../../components/header/header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartonpackDetailsPageRoutingModule,
    HeaderComponent,
    Select
  ],
  declarations: [ CartonpackDetailsPage ]
})
export class CartonpackDetailsPageModule { }
