import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./componentes/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./componentes/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./componentes/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'lista-usuarios',
    loadChildren: () => import('./componentes/lista-usuarios/lista-usuarios.module').then( m => m.ListaUsuariosPageModule)
  },
  {
    path: 'productos',
    loadChildren: () => import('./componentes/productos/productos.module').then( m => m.ProductosPageModule)
  },
  {
    path: 'encuesta-cliente',
    loadChildren: () => import('./componentes/encuesta-cliente/encuesta-cliente.module').then( m => m.EncuestaClientePageModule)
  },
  {
    path: 'encuesta-empleado',
    loadChildren: () => import('./componentes/encuesta-empleado/encuesta-empleado.module').then( m => m.EncuestaEmpleadoPageModule)
  },  {
    path: 'juego10',
    loadChildren: () => import('./componentes/juegos/juego10/juego10.module').then( m => m.Juego10PageModule)
  },
  {
    path: 'juego15',
    loadChildren: () => import('./componentes/juegos/juego15/juego15.module').then( m => m.Juego15PageModule)
  },
  {
    path: 'juego20',
    loadChildren: () => import('./componentes/juegos/juego20/juego20.module').then( m => m.Juego20PageModule)
  }



  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
