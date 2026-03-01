import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PoMapPolypackPageRoutingModule } from './po-map-polypack-routing.module';

import { PoMapPolypackPage } from './po-map-polypack.page';
import { Select } from 'primeng/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PoMapPolypackPageRoutingModule,
    Select
  ],
  declarations: [PoMapPolypackPage]
})
export class PoMapPolypackPageModule {}
