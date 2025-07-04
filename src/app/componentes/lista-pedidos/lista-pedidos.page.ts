import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';
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
  mostrarPagoCuenta = false;
  metodoSeleccionado: string = '';
  numeroTarjeta: string = '';
  vencimiento: string = '';
  codigoSeguridad: string = '';
  mensajeConfirmacion: string = '';
  pedido: any;
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

  
    mostrarContenedores(contenedor: string, pedido?:any)
  {
    switch(contenedor)
    {
      case "opciones":
        this.mostrarOpciones = !this.mostrarOpciones;
        break;
      case "cuenta":
        this.mostrarPagoCuenta = !this.mostrarPagoCuenta;
        this.pedido = pedido;
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
    await this.firebaseService.modificarEstadoPedido('estadoPedido','En preparación',pedido);
    
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


  async confirmarEntregaDePedido(pedido: any)
  {
    await this.firebaseService.modificarEstadoPedido('estadoPedido','Entregado',pedido);
    this.listaPedidos = await this.firebaseService.getListaPedidosPorCliente(this.user.uid);


  }

  seleccionarMetodo(metodo: string) {
  this.metodoSeleccionado = metodo;
  this.mensajeConfirmacion = '';
}

async pagarCuenta() {
  if (!this.metodoSeleccionado) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Debés seleccionar un método de pago.',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
      customClass: {
        popup: 'mi-popup',
        title: 'mi-titulo',
        confirmButton: 'mi-boton',
        htmlContainer: 'mi-texto'
      }
    });
    return;
  }

  if (this.metodoSeleccionado === 'tarjeta') {
    if (!/^\d{16}$/.test(this.numeroTarjeta)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El número de tarjeta debe tener 16 dígitos.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-popup',
          title: 'mi-titulo',
          confirmButton: 'mi-boton',
          htmlContainer: 'mi-texto'
        }
      });
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(this.vencimiento)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El vencimiento debe tener el formato MM/AA.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-popup',
          title: 'mi-titulo',
          confirmButton: 'mi-boton',
          htmlContainer: 'mi-texto'
        }
      });
      return;
    }

    const [mes, anio] = this.vencimiento.split('/').map(Number);
    if (mes < 1 || mes > 12) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Mes inválido en la fecha de vencimiento.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-popup',
          title: 'mi-titulo',
          confirmButton: 'mi-boton',
          htmlContainer: 'mi-texto'
        }
      });
      return;
    }

    if (!/^\d{3,4}$/.test(this.codigoSeguridad)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El código de seguridad debe tener 3 o 4 dígitos.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-popup',
          title: 'mi-titulo',
          confirmButton: 'mi-boton',
          htmlContainer: 'mi-texto'
        }
      });
      return;
    }

    
    
    await this.firebaseService.modificarEstadoPedido('estadoPedido','Esperando confirmación de pago',this.pedido);
    this.listaPedidos = await this.firebaseService.getListaPedidosPorCliente(this.user.uid);
    
    Swal.fire({
      icon: 'success',
      title: 'Pago exitoso',
      text: '✅ Se ha válido correctamente. Esperando confirmación del mozo.',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
      customClass: {
        popup: 'mi-popup',
        title: 'mi-titulo',
        confirmButton: 'mi-boton',
        htmlContainer: 'mi-texto'
      }
    });



  } else if (this.metodoSeleccionado === 'efectivo') {
    Swal.fire({
      icon: 'success',
      title: 'Pago en caja',
      text: '💵 Seleccionaste pagar en caja. Acercate a la caja para pagar.',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
      customClass: {
        popup: 'mi-popup',
        title: 'mi-titulo',
        confirmButton: 'mi-boton',
        htmlContainer: 'mi-texto'
      }
    });

    await this.firebaseService.modificarEstadoPedido('estadoPedido','Esperando confirmación de pago',this.pedido);
    this.listaPedidos = await this.firebaseService.getListaPedidosPorCliente(this.user.uid);
  }

  // Opcional: limpiar datos después de pagar
  this.numeroTarjeta = '';
  this.vencimiento = '';
  this.codigoSeguridad = '';
  this.metodoSeleccionado = '';
}


async confirmarPagoCliente(pedido:any)
{
    await this.firebaseService.modificarEstadoPedido('estadoPedido','Pagado',pedido);

    this.listaPedidos = await this.firebaseService.getListaPedidos();

    await this.firebaseService.liberarMesa(pedido.clienteUid);
    




}



}
