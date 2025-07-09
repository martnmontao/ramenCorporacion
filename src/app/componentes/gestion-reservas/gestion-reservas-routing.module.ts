import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionReservasPage } from './gestion-reservas.page';

const routes: Routes = [
  {
    path: '',
    component: GestionReservasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionReservasPageRoutingModule {}
