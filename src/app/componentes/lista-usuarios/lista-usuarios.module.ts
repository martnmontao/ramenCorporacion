import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaUsuariosPageRoutingModule } from './lista-usuarios-routing.module';

import { ListaUsuariosPage } from './lista-usuarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaUsuariosPageRoutingModule
  ],
  declarations: [ListaUsuariosPage]
})
export class ListaUsuariosPageModule {}
