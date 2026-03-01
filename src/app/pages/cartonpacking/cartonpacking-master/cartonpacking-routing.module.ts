import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartonpackingPage } from './cartonpacking.page';

const routes: Routes = [
  {
    path: '',
    component: CartonpackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartonpackingPageRoutingModule {}
