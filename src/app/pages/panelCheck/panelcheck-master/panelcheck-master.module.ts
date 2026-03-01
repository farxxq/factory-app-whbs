import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PanelcheckMasterPageRoutingModule } from './panelcheck-master-routing.module';

import { PanelcheckMasterPage } from './panelcheck-master.page';
import { HeaderComponent } from '../../../components/header/header.component';
import { Select } from 'primeng/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PanelcheckMasterPageRoutingModule,
    HeaderComponent,
    Select
  ],
  declarations: [PanelcheckMasterPage]
})
export class PanelcheckMasterPageModule {}
