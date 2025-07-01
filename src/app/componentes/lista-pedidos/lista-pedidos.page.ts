import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';
@Component({
  selector: 'app-lista-pedidos',
  templateUrl: './lista-pedidos.page.html',
  styleUrls: ['./lista-pedidos.page.scss'],
  standalone: false
})
export class ListaPedidosPage implements OnInit {

  mostrarOpciones = false;
  listaPedidos: any = [];
  user: any;
 // mostrarProductos = false;
  constructor(private firebaseService: FirebaseService, private router: Router) { 
  }
  
  async ngOnInit() 
  {
    
    this.user = await this.firebaseService.obtenerUsuarioLogueado();
    if(this.user.tipo == "cocinero" || this.user.tipo == "bartender")
    {
      this.listaPedidos = await this.firebaseService.obtenerPedidosParaUsuario(this.user.tipo);
    }
    else if(this.user.tipo == "mozo")
    {
      this.listaPedidos = await this.firebaseService.getListaPedidos();
    }
    else if(this.user.perfil == "cliente")
    {
      
      this.listaPedidos = await this.firebaseService.getListaPedidosPorCliente(this.user.uid);
    }
    console.log(this.listaPedidos)

  }

  
    mostrarContenedores(contenedor: string)
  {
    switch(contenedor)
    {
      case "opciones":
        this.mostrarOpciones = !this.mostrarOpciones;
        break;
   
    }
  }

  irA(path:string)
  {


    this.router.navigateByUrl(path);

  }

  cerrarSesion()
  {
   this.firebaseService.cerrarSesion();
  }

  mostrarProductos(pedido: any) 
  {
  // Alternar solo el pedido clickeado
    pedido.verPedido = !pedido.verPedido;
  }

  async tomarPedido(pedido: any)//lo hace el mozo
  {
    
    await this.firebaseService.modificarEstadoPedido('estadoPedido','Esperando confirmación',pedido);
    this.listaPedidos = await this.firebaseService.getListaPedidos();
  }

  async prepararPedido(pedido: any)
  {
    await this.firebaseService.modificarEstadoProductos(pedido, this.user.tipo, 'En preparación');
    
    this.listaPedidos = await this.firebaseService.obtenerPedidosParaUsuario(this.user.tipo);
   
    
  }


  async terminarPedido(pedido: any)
  {
    await this.firebaseService.modificarEstadoProductos(pedido, this.user.tipo, 'Terminado');
    
    this.listaPedidos = await this.firebaseService.obtenerPedidosParaUsuario(this.user.tipo);
   
  }


  async entregarPedido(pedido: any)
  {
    await this.firebaseService.modificarEstadoPedido('estadoPedido','Esperando cliente',pedido);
    this.listaPedidos = await this.firebaseService.getListaPedidos();


  }

}
