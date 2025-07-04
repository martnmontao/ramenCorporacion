import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Juego10Page } from './juego10.page';

const routes: Routes = [
  {
    path: '',
    component: Juego10Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Juego10PageRoutingModule {}
