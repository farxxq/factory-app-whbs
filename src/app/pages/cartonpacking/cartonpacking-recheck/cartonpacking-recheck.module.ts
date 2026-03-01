import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartonpackingRecheckPageRoutingModule } from './cartonpacking-recheck-routing.module';

import { CartonpackingRecheckPage } from './cartonpacking-recheck.page';
import { Select } from 'primeng/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartonpackingRecheckPageRoutingModule,
    Select,
    ReactiveFormsModule
  ],
  declarations: [CartonpackingRecheckPage]
})
export class CartonpackingRecheckPageModule { }
