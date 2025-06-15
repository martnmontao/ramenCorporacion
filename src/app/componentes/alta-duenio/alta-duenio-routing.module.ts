import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AltaDuenioPage } from './alta-duenio.page';

const routes: Routes = [
  {
    path: '',
    component: AltaDuenioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AltaDuenioPageRoutingModule {}
