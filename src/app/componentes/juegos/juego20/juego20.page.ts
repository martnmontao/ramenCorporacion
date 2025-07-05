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
  constructor(private router: Router, private firebase: FirebaseService){}

  async ngOnInit() {
    this.user = this.firebase.obtenerUsuarioLogueado();

    const yaTieneDescuento = await this.firebase.verificarDescuentoJugado(this.user.uid);
    if (yaTieneDescuento) {
      await Swal.fire({
        icon: 'info',
        title: 'Ya jugaste',
        text: 'Ya participaste y obtuviste un descuento.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      });
      this.router.navigate(['/juegos-vista']);
      return;
    }
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
      }).then(async()=>{
        await this.firebase.guardarDescuento(this.user.uid, 0);
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
        await this.firebase.guardarDescuento(this.user.uid, 20);
        await this.firebase.aplicarDescuentoAlPedido(this.user.uid);
        this.router.navigate(['/juegos-vista']);
      });

    } else{
      Swal.fire({
        icon: 'error',
        title: '¡Perdiste!',
        text: '¡Será la próxima!',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        }).then(async()=>{
          await this.firebase.guardarDescuento(this.user.uid, 0);
          this.router.navigate(['/juegos-vista']);
        });

    }

  }

    reiniciar() {
    this.jugadaJugador = null;
    this.jugadaRamen = null;
  }

}
