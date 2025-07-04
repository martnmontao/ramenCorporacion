import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Juego15Page } from './juego15.page';

const routes: Routes = [
  {
    path: '',
    component: Juego15Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Juego15PageRoutingModule {}
