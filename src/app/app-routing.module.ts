import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


const routes: Routes = [

  /*
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' // Esto es obligatorio cuando se usa redirectTo
  },*/
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
    path: 'alta-mesa',
    loadChildren: () => import('./componentes/alta-mesa/alta-mesa.module').then( m => m.AltaMesaPageModule)
  },
  {
    path: 'lista-espera',
    loadChildren: () => import('./componentes/lista-espera/lista-espera.module').then( m => m.ListaEsperaPageModule)
  },
  {
    path: 'solicitar-mesa',
    loadChildren: () => import('./componentes/solicitar-mesa/solicitar-mesa.module').then( m => m.SolicitarMesaPageModule)
  },
  {
    path: 'home-cliente',
    loadChildren: () => import('./componentes/home-cliente/home-cliente.module').then( m => m.HomeClientePageModule)
  },
  {
    path: 'lista-pedidos',
    loadChildren: () => import('./componentes/lista-pedidos/lista-pedidos.module').then( m => m.ListaPedidosPageModule)},
  
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
  },
  {
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
  },
  {
    path: 'estadisticas-encuesta',
    loadChildren: () => import('./componentes/estadisticas-encuesta/estadisticas-encuesta.module').then( m => m.EstadisticasEncuestaPageModule)
  },
      {
    path: 'chat-mozo',
    loadChildren: () => import('./componentes/chat-mozo/chat-mozo.module').then( m => m.ChatMozoPageModule)
  },
  {
    path: 'juegos-vista',
    loadChildren: () => import('./componentes/juegos-vista/juegos-vista.module').then( m => m.JuegosVistaPageModule)
  },
  {
    path: 'splash-screen',
    loadChildren: () => import('./componentes/splash-screen/splash-screen.module').then( m => m.SplashScreenPageModule)
  },
  {
    path: 'reservas',
    loadChildren: () => import('./componentes/reservas/reservas.module').then( m => m.ReservasPageModule)
  },
  {
    path: 'gestion-reservas',
    loadChildren: () => import('./componentes/gestion-reservas/gestion-reservas.module').then( m => m.GestionReservasPageModule)
  }



  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
