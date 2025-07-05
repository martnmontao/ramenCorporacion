import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JuegosVistaPageRoutingModule } from './juegos-vista-routing.module';

import { JuegosVistaPage } from './juegos-vista.page';
import { RouterLink } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterLink,
    JuegosVistaPageRoutingModule
  ],
  declarations: [JuegosVistaPage]
})
export class JuegosVistaPageModule {}
