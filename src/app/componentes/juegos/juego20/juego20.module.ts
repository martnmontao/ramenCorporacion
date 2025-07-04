import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Juego20PageRoutingModule } from './juego20-routing.module';

import { Juego20Page } from './juego20.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Juego20PageRoutingModule
  ],
  declarations: [Juego20Page]
})
export class Juego20PageModule {}
