import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-juego10',
  standalone:false,
  templateUrl: './juego10.page.html',
  styleUrls: ['./juego10.page.scss'],
})
export class Juego10Page implements OnInit {

  ollas = Array(4).fill(null);
  indiceGanador = 0;
  seleccion: number | null = null;
  juegoTerminado = false;
  user:any;
  mostrarOpciones = false;
  empezar = false;
  constructor(private router: Router, private firebase: FirebaseService) { }

  async ngOnInit() {
    this.user = await this.firebase.obtenerUsuarioLogueado();
    const pedido = await this.firebase.obtenerPedidoPorUidUsuario(this.user.uid);
    const yaTieneDescuento = await this.firebase.verificarJuegoJugado(pedido, 'juego10');
    if (yaTieneDescuento) {
      await Swal.fire({
        icon: 'info',
        title: 'Ya jugaste',
        text: 'Ya has participado por un descuento.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      this.router.navigate(['/juegos-vista']);
      return;
    }
    else
    {
      this.empezar = true;
      this.indiceGanador = Math.floor(Math.random() * 4);
      this.reiniciarJuego();

    }
  }
    irA(path:string)
  {
    this.mostrarOpciones = false;

    this.router.navigateByUrl(path);
  }

  

  cerrarSesion(){
  this.firebase.cerrarSesion();
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


  reiniciarJuego(){
    this.seleccion = null;
    this.juegoTerminado = false;
  }

  async elegirOlla(index: number){
    if(this.juegoTerminado) return;

    this.seleccion = index;
    this.juegoTerminado = true;
  
    if (index === this.indiceGanador) {
      await Swal.fire({
        icon: 'success',
        title: '¡Felicidades!',
        text: '¡Ganaste un descuento del 10% en tu compra!',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      }).then(async()=>{
        const pedido = await this.firebase.obtenerPedidoPorUidUsuario(this.user.uid);
        if(pedido)
        {
          await this.firebase.guardarDescuento(pedido,'juego10', 10);

        }
        this.router.navigate(['/juegos-vista']);
        return;
      });
    } else {
      await Swal.fire({
        icon: 'error',
        title: '¡Perdiste!',
        text: '¡Uy, ese no era! Será la próxima',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      }).then(async()=>{
        const pedido = await this.firebase.obtenerPedidoPorUidUsuario(this.user.uid);

        await this.firebase.guardarDescuento(pedido, 'juego10',0);
        this.router.navigate(['/juegos-vista']);
        return;
      });
    }
  }

  mostrarContenido(index: number): string {
    const ruta = 'assets/imagenes/juegos/';

    if(this.seleccion === null){
      return `${ruta}cerrado10.png`;
    }

    if(index === this.indiceGanador){
      return `${ruta}ganador10.png`;
    }

    return  `${ruta}vacio10.png`;
  }

}
