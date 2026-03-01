import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPolypackPageRoutingModule } from './add-polypack-routing.module';

import { AddPolypackPage } from './add-polypack.page';
import { IonRouterOutlet } from '@ionic/angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPolypackPageRoutingModule,
    TitleCasePipe
  ],
  declarations: [AddPolypackPage]
})
export class AddPolypackPageModule {}
