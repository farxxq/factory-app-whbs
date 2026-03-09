import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartonpackingPageRoutingModule } from './cartonpacking-routing.module';

import { CartonpackingPage } from './cartonpacking.page';
import { HeaderComponent } from '../../../components/header/header.component';

//charts
import { NgChartsModule } from 'ng2-charts';

import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';

import { Select } from 'primeng/select';
import { CartonpackDetailsPageModule } from '../cartonpack-details/cartonpack-details.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartonpackingPageRoutingModule,
    HeaderComponent,
    NgChartsModule,
    ButtonModule,
    DatePicker,
    Select,
    CartonpackDetailsPageModule
  ],
  declarations: [CartonpackingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CartonpackingPageModule {}
