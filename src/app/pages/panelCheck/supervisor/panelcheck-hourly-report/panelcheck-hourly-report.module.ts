import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PanelcheckHourlyReportPageRoutingModule } from './panelcheck-hourly-report-routing.module';

import { PanelcheckHourlyReportPage } from './panelcheck-hourly-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PanelcheckHourlyReportPageRoutingModule
  ],
  declarations: [PanelcheckHourlyReportPage]
})
export class PanelcheckHourlyReportPageModule {}
