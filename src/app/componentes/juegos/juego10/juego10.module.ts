import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonButton, IonicModule } from '@ionic/angular';

import { Juego10PageRoutingModule } from './juego10-routing.module';

import { Juego10Page } from './juego10.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Juego10PageRoutingModule
  ],
  declarations: [Juego10Page]
})
export class Juego10PageModule {}
