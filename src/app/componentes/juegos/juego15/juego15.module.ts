import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonContent, IonicModule } from '@ionic/angular';

import { Juego15PageRoutingModule } from './juego15-routing.module';

import { Juego15Page } from './juego15.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Juego15PageRoutingModule
  ],
  declarations: [Juego15Page]
})
export class Juego15PageModule {}
