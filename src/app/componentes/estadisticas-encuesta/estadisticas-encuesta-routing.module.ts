import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EstadisticasEncuestaPage } from './estadisticas-encuesta.page';

const routes: Routes = [
  {
    path: '',
    component: EstadisticasEncuestaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstadisticasEncuestaPageRoutingModule {}
