import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelcheckAddPcsPage } from './panelcheck-add-pcs.page';

const routes: Routes = [
  {
    path: '',
    component: PanelcheckAddPcsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelcheckAddPcsPageRoutingModule {}
