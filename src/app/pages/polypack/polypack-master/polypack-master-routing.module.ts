import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PolypackMasterPage } from './polypack-master.page';

const routes: Routes = [
  {
    path: '',
    component: PolypackMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PolypackMasterPageRoutingModule {}
