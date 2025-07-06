import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; 
import { Producto } from 'src/app/interfaces/producto.';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false
})
export class ProductosPage implements OnInit {

  mostrarFormAgregarProducto = false;
  nombreProducto: string = "";
  tipoProducto: string = "";
  descripcionProducto: string = "";
  precioProducto: number = 0;
  tiempoPreparacionProducto: number = 0;
  fotoProducto: string | undefined;
  fotosProductos: string[] = [];
  listaProductos: Producto[] = [];
  filtroSeleccionado: string = "comida";
  mostrarFormEditarProducto = false;
  productoEditandoId?: string;
  isLoading: boolean = false;
  mostrarOpciones = false;
  user: any;
  mostrarPedido = false;
  importeTotalPedido = 0;
  tiempoTotalPedido = 0;
  listaPedido: {nombreProducto: string, tipoProducto: string, precioProducto: number, tiempoPreparacion: number, estadoPreparacion: string}[] = [];



  constructor(private firebaseService: FirebaseService, private router: Router) { }

  async ngOnInit() {
    this.user = await this.firebaseService.obtenerUsuarioLogueado();
    
      this.isLoading = true;
      this.firebaseService
      .getCollection<Producto>('productos', 'tipoProducto', this.filtroSeleccionado)
      .subscribe(productos => {
       
        this.listaProductos = productos;
        console.log
        setTimeout(() => {
          this.isLoading = false;
          
        }, 500);
      });

  }

  irA(path: string)
  { 
    this.router.navigateByUrl(path);
  }

  cerrarSesion()
  {
    this.firebaseService.cerrarSesion().then(respuesta => 
    {
      this.router.navigateByUrl('login');
    }
    )
  }



  mostrarContenedor(contenedor: string, producto?: Producto)
  {
    switch(contenedor)
    {
      case "formAgregarProductos":
        this.mostrarFormAgregarProducto = !this.mostrarFormAgregarProducto;
        break;
      case "formEditarProductos":
        this.mostrarFormEditarProducto = !this.mostrarFormEditarProducto;
        if (!producto) 
        {
          console.error('No existe id para este producto, no se puede actualizar.');
          return;
        }
        this.productoEditandoId = producto.id;
        this.descripcionProducto = producto.descripcionProducto;
        this.nombreProducto = producto.nombreProducto;
        this.precioProducto = producto.precioProducto;
        this.tiempoPreparacionProducto = producto.tiempoPreparacionProducto;
        this.tipoProducto = producto.tipoProducto;
        break;
      case "mostrarOpciones":
        this.mostrarOpciones = !this.mostrarOpciones;
        break;
      case "mostrarPedido":
        this.mostrarPedido = !this.mostrarPedido;
        break;
    }
  }

  agregarProducto()
  {
    let data = 
    {
      nombreProducto: this.nombreProducto,
      tipoProducto: this.tipoProducto,
      descripcionProducto: this.descripcionProducto,
      precioProducto: this.precioProducto,
      tiempoPreparacionProducto: this.tiempoPreparacionProducto,
      fotosProducto: this.fotosProductos
    }


    try
    {
      this.firebaseService.agregarDocumento(data, "productos").then(respuesta => 
      {
        this.fotosProductos = [];
        this.nombreProducto = "";
        this.descripcionProducto = "";
        this.precioProducto = 0;
        this.tiempoPreparacionProducto = 0;
      }
      )
    }
    catch(error)
    {
      console.log(error);
    }

  }

  async tomarFoto() 
   {
    const image = await Camera.getPhoto({
      quality: 10,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    this.fotoProducto = "data:image/jpeg;base64," + image.base64String;
    
    this.fotosProductos.push(this.fotoProducto);

  }


  seleccionarFiltro(filtro: string)
  {
    this.isLoading = true;
    this.filtroSeleccionado = filtro;
      this.firebaseService
      .getCollection<Producto>('productos', 'tipoProducto', filtro)
      .subscribe(productos => {
        this.listaProductos = productos;
        setTimeout(() => {
          this.isLoading = false;
          
        }, 500);
      });
  }

  editarProducto()
  { 
      this.filtroSeleccionado = this.tipoProducto;
      if (!this.productoEditandoId) 
      {
        console.error('No existe id para este producto, no se puede actualizar.');
        return;
      }
      const data = 
      {
        nombreProducto: this.nombreProducto,
        tipoProducto: this.tipoProducto,
        descripcionProducto: this.descripcionProducto,
        precioProducto: this.precioProducto,
        tiempoPreparacionProducto: this.tiempoPreparacionProducto,
      };
  
  this.firebaseService.updateDocumento('productos', this.productoEditandoId, data)
    .then(() => {
      console.log('Producto actualizado correctamente');
    })
    .catch(error => {
      console.error(error);
    });
  
    
  }


  agregarPedido(producto: Producto)
  {
    this.importeTotalPedido = 0;
    this.listaPedido.push({  
    nombreProducto: producto.nombreProducto,
    tipoProducto: producto.tipoProducto,
    precioProducto: producto.precioProducto,
    tiempoPreparacion: producto.tiempoPreparacionProducto,
    estadoPreparacion: 'en espera'
  })
      
    this.listaPedido.forEach(element => {
      this.importeTotalPedido += element.precioProducto
      this.tiempoTotalPedido += element.tiempoPreparacion;
    });



    console.log(this.listaPedido);

  }

  eliminarPedido(nombreProducto: string, precioProducto: number, tiempoProducto: number)
  {
    const index = this.listaPedido.findIndex(
      pedido => pedido.nombreProducto === nombreProducto
    );

    if (index !== -1) {
      this.listaPedido.splice(index, 1);
    }

    this.importeTotalPedido -= precioProducto;
    this.tiempoTotalPedido -= tiempoProducto;

  }

  async finalizarPedido()
  {

    const mesa = await this.firebaseService.obtenerMesaPorUidUsuario(this.user.uid);

    let data =
    {
      nombreUsuario: this.user.nombreUsuario,
      numeroMesa: mesa?.numeroMesa,
      clienteUid: this.user.uid,
      productosSolicitados: this.listaPedido,
      estadoPedido: 'Pendiente',
      importeTotal: this.importeTotalPedido,
      pagado: 'No pagado',
      imagenUsuario: this.user.imagenUsuario,
      verPedido: false,
      descuento: 1
    }

    this.firebaseService.agregarDocumento(data, 'pedidos').then(() => 
    {
       Swal.fire({
                  icon: 'success', 
                  title: 'Pedido tomado',
                  text: "Se ha realizado el pedido, espere a ser tomado.",
                  confirmButtonText: 'Aceptar',
                  heightAuto: false 
                });
    })
  }


  
}
