import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitarMesaPage } from './solicitar-mesa.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitarMesaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitarMesaPageRoutingModule {}
