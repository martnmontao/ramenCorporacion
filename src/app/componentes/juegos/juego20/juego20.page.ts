import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-juego20',
  standalone:false,
  templateUrl: './juego20.page.html',
  styleUrls: ['./juego20.page.scss'],
})
export class Juego20Page {

  opciones = ['piedra', 'papel', 'tijera'];
  jugadaJugador: string | null = null;
  jugadaRamen: string | null = null;

  constructor(private router: Router){}

  elegir(opcion: string){
    this.jugadaJugador = opcion;
    this.jugadaRamen = this.opciones[Math.floor(Math.random() * 3)];

    setTimeout(() => this.evaluarResultado(), 500);
  }

  evaluarResultado(){
    if(this.jugadaJugador === this.jugadaRamen){
      Swal.fire({
        icon: 'info',
        title: '¡Empate!',
        text: '¡Ambos eligieron lo mismo!',
        confirmButtonText: 'Reintentar',
        heightAuto: false,
      }).then(() => this.reiniciar());
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
      }).then(() => this.router.navigate(['/login']));
    } else{
      Swal.fire({
        icon: 'error',
        title: '¡Perdiste!',
        text: '¡Será la próxima!',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        }).then(() => this.router.navigate(['/login']));
    }

  }

    reiniciar() {
    this.jugadaJugador = null;
    this.jugadaRamen = null;
  }

}
