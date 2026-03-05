import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PanelcheckReplacePcsPageRoutingModule } from './panelcheck-replace-pcs-routing.module';

import { PanelcheckReplacePcsPage } from './panelcheck-replace-pcs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PanelcheckReplacePcsPageRoutingModule
  ],
  declarations: [PanelcheckReplacePcsPage]
})
export class PanelcheckReplacePcsPageModule {}
