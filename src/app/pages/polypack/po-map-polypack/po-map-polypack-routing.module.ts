import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PoMapPolypackPage } from './po-map-polypack.page';

const routes: Routes = [
  {
    path: '',
    component: PoMapPolypackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PoMapPolypackPageRoutingModule {}
