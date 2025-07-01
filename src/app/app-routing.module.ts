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
  },  {
    path: 'lista-pedidos',
    loadChildren: () => import('./componentes/lista-pedidos/lista-pedidos.module').then( m => m.ListaPedidosPageModule)
  }




  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
