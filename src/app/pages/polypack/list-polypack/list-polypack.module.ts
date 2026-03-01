import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule, ModalController } from '@ionic/angular';

import { ListPolypackPageRoutingModule } from './list-polypack-routing.module';

import { ListPolypackPage } from './list-polypack.page';
import { SelectModule } from 'primeng/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPolypackPageRoutingModule,
    SelectModule
  ],
  declarations: [ListPolypackPage]
})
export class ListPolypackPageModule {}
