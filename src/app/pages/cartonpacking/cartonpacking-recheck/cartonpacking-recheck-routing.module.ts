import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartonpackingRecheckPage } from './cartonpacking-recheck.page';

const routes: Routes = [
  {
    path: '',
    component: CartonpackingRecheckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartonpackingRecheckPageRoutingModule {}
