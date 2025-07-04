import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Juego20Page } from './juego20.page';

const routes: Routes = [
  {
    path: '',
    component: Juego20Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Juego20PageRoutingModule {}
