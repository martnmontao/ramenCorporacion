import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EncuestaClientePageRoutingModule } from './encuesta-cliente-routing.module';

import { EncuestaClientePage } from './encuesta-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    EncuestaClientePageRoutingModule
  ],
  declarations: [EncuestaClientePage]
})
export class EncuestaClientePageModule {}
