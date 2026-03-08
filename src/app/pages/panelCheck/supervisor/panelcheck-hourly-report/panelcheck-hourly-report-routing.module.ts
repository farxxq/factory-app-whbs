import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelcheckHourlyReportPage } from './panelcheck-hourly-report.page';

const routes: Routes = [
  {
    path: '',
    component: PanelcheckHourlyReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelcheckHourlyReportPageRoutingModule {}
