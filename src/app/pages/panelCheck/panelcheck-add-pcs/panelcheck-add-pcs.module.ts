import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PanelcheckAddPcsPageRoutingModule } from './panelcheck-add-pcs-routing.module';

import { PanelcheckAddPcsPage } from './panelcheck-add-pcs.page';
import { Select } from 'primeng/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PanelcheckAddPcsPageRoutingModule,
    Select
  ],
  declarations: [PanelcheckAddPcsPage]
})
export class PanelcheckAddPcsPageModule { }
