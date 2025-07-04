import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EncuestaEmpleadoPageRoutingModule } from './encuesta-empleado-routing.module';

import { EncuestaEmpleadoPage } from './encuesta-empleado.page';
import { EstadisticasEncuestaPage } from '../estadisticas-encuesta/estadisticas-encuesta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    EncuestaEmpleadoPageRoutingModule,EstadisticasEncuestaPage
  ],
  declarations: [EncuestaEmpleadoPage]
})
export class EncuestaEmpleadoPageModule {}
