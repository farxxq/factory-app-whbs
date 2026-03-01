import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapPolypackPage } from './map-polypack.page';

const routes: Routes = [
  {
    path: '',
    component: MapPolypackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapPolypackPageRoutingModule {}
