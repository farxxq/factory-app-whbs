import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelcheckMasterPage } from './panelcheck-master.page';

const routes: Routes = [
  {
    path: '',
    component: PanelcheckMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelcheckMasterPageRoutingModule {}
