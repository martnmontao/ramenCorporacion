import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaUsuariosPage } from './lista-usuarios.page';

const routes: Routes = [
  {
    path: '',
    component: ListaUsuariosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaUsuariosPageRoutingModule {}
