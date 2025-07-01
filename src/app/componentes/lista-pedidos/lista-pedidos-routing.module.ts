import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaPedidosPage } from './lista-pedidos.page';

const routes: Routes = [
  {
    path: '',
    component: ListaPedidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaPedidosPageRoutingModule {}
