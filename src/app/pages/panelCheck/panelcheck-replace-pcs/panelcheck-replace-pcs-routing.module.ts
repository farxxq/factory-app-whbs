import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelcheckReplacePcsPage } from './panelcheck-replace-pcs.page';

const routes: Routes = [
  {
    path: '',
    component: PanelcheckReplacePcsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelcheckReplacePcsPageRoutingModule {}
