import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListPolypackPage } from './list-polypack.page';

const routes: Routes = [
  {
    path: '',
    component: ListPolypackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListPolypackPageRoutingModule {}
