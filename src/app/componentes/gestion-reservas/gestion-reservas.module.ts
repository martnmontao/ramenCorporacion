import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionReservasPageRoutingModule } from './gestion-reservas-routing.module';

import { GestionReservasPage } from './gestion-reservas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionReservasPageRoutingModule
  ],
  declarations: [GestionReservasPage]
})
export class GestionReservasPageModule {}
