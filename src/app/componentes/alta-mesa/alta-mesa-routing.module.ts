import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AltaMesaPage } from './alta-mesa.page';

const routes: Routes = [
  {
    path: '',
    component: AltaMesaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AltaMesaPageRoutingModule {}
