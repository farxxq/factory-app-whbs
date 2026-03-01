import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddPolypackPage } from './add-polypack.page';

const routes: Routes = [
  {
    path: '',
    component: AddPolypackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddPolypackPageRoutingModule {}
