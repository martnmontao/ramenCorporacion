import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';

@Component({
  selector: 'app-juego20',
  standalone:false,
  templateUrl: './juego20.page.html',
  styleUrls: ['./juego20.page.scss'],
})
export class Juego20Page implements OnInit{

  opciones = ['piedra', 'papel', 'tijera'];
  jugadaJugador: string | null = null;
  jugadaRamen: string | null = null;
  user:any;
  mostrarOpciones = false;
  empezar = false;
  constructor(private router: Router, private firebase: FirebaseService){}

  async ngOnInit() {
    this.user = await this.firebase.obtenerUsuarioLogueado();

    const pedido = await this.firebase.obtenerPedidoPorUidUsuario(this.user.uid);
    const yaTieneDescuento = await this.firebase.verificarDescuentoJugado(pedido);
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

    this.empezar = true;
  }

  elegir(opcion: string){
    this.jugadaJugador = opcion;
    this.jugadaRamen = this.opciones[Math.floor(Math.random() * 3)];

    setTimeout(() => this.evaluarResultado(), 500);
  }

  async evaluarResultado(){
    if(this.jugadaJugador === this.jugadaRamen){
      Swal.fire({
        icon: 'info',
        title: '¡Empate!',
        text: '¡Ambos eligieron lo mismo!',
        confirmButtonText: 'Reintentar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      }).then(async()=>{
        const pedido = await this.firebase.obtenerPedidoPorUidUsuario(this.user.uid);

        await this.firebase.guardarDescuento(pedido, 0);
        this.router.navigate(['/juegos-vista']);
      });
      

    }else if(
      (this.jugadaJugador === 'piedra' && this.jugadaRamen === 'tijera') ||
      (this.jugadaJugador === 'papel' && this.jugadaRamen === 'piedra') ||
      (this.jugadaJugador === 'tijera' && this.jugadaRamen === 'papel')
    ){
      Swal.fire({
        icon: 'success',
        title: '¡Felicidades!',
        text: '¡Ganaste un descuento del 20% en tu compra!',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      }).then(async()=>{
        const pedido = await this.firebase.obtenerPedidoPorUidUsuario(this.user.uid);
        if(pedido)
        {
          await this.firebase.guardarDescuento(pedido, 20);
        }
        this.router.navigate(['/juegos-vista']);
      });

    } else{
      Swal.fire({
        icon: 'error',
        title: '¡Perdiste!',
        text: '¡Será la próxima!',
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

          await this.firebase.guardarDescuento(pedido, 0);
          this.router.navigate(['/juegos-vista']);
        });

    }

  }

    reiniciar() {
    this.jugadaJugador = null;
    this.jugadaRamen = null;
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
}
