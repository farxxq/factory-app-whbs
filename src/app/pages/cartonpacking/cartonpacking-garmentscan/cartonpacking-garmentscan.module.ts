import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartonpackingGarmentscanPageRoutingModule } from './cartonpacking-garmentscan-routing.module';

import { CartonpackingGarmentscanPage } from './cartonpacking-garmentscan.page';
import { HeaderComponent } from "../../../components/header/header.component";
import { Select } from 'primeng/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartonpackingGarmentscanPageRoutingModule,
    HeaderComponent,
    Select
  ],
  declarations: [ CartonpackingGarmentscanPage ]
})
export class CartonpackingGarmentscanPageModule { }
