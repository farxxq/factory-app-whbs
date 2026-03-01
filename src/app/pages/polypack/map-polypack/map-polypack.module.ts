import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPolypackPageRoutingModule } from './map-polypack-routing.module';

import { MapPolypackPage } from './map-polypack.page';
import { Select } from 'primeng/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Select,
    TitleCasePipe,
    MapPolypackPageRoutingModule
  ],
  declarations: [MapPolypackPage]
})
export class MapPolypackPageModule {}
