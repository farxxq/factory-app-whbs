import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PolypackMasterPageRoutingModule } from './polypack-master-routing.module';

import { PolypackMasterPage } from './polypack-master.page';
import { HeaderComponent } from "../../../components/header/header.component";

//prime ng
import { Select } from 'primeng/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PolypackMasterPageRoutingModule,
    Select,
    HeaderComponent,
  ],
  declarations: [ PolypackMasterPage ],
})
export class PolypackMasterPageModule { }
