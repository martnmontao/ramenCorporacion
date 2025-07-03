import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EncuestaEmpleadoPage } from './encuesta-empleado.page';

const routes: Routes = [
  {
    path: '',
    component: EncuestaEmpleadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EncuestaEmpleadoPageRoutingModule {}
