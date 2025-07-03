import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EncuestaEmpleadoPageRoutingModule } from './encuesta-empleado-routing.module';

import { EncuestaEmpleadoPage } from './encuesta-empleado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    EncuestaEmpleadoPageRoutingModule
  ],
  declarations: [EncuestaEmpleadoPage]
})
export class EncuestaEmpleadoPageModule {}
