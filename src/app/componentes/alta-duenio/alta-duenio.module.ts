import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AltaDuenioPageRoutingModule } from './alta-duenio-routing.module';

import { AltaDuenioPage } from './alta-duenio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AltaDuenioPageRoutingModule
  ],
  declarations: [AltaDuenioPage]
})
export class AltaDuenioPageModule {}
