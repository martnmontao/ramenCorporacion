import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AltaMesaPageRoutingModule } from './alta-mesa-routing.module';

import { AltaMesaPage } from './alta-mesa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AltaMesaPageRoutingModule
  ],
  declarations: [AltaMesaPage]
})
export class AltaMesaPageModule {}
