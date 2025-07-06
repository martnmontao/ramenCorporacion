import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';

@Component({
  selector: 'app-juego15',
  standalone:false,
  templateUrl: './juego15.page.html',
  styleUrls: ['./juego15.page.scss'],
})
export class Juego15Page implements OnInit {
  tiempo: number = 15;
  temporizador: any;
  juegoTerminado = false;
  mostrarOpciones = false;

  imagenesOriginales: string[] = [
    'assets/imagenes/juegos/ramen.png',
    'assets/imagenes/juegos/palillos.png',
    'assets/imagenes/juegos/gatito.png',
    'assets/imagenes/juegos/arco.png'
  ];

  cartas: { imagen: string; descubierta: boolean; emparejada: boolean }[] = [];
  imagenReverso = 'assets/imagenes/juegos/reverso.png';
  cartasVolteadas: number[] = [];
  bloqueo = false;
  user:any;

  constructor(private cd: ChangeDetectorRef, private router: Router, private firebase: FirebaseService) {}

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
    else
    {
      this.inicializarCartas();
      this.iniciarTemporizador();

    }
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
    this.inicializarCartas();
    this.iniciarTemporizador();
  }

  iniciarTemporizador() {
    this.tiempo = 15;
    this.juegoTerminado = false;
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = setInterval(() => {
      this.tiempo--;
      this.cd.detectChanges();

      if(this.tiempo <= 0){
        this.detenerTemporizador();
      }
    }, 1000);
  }

  async detenerTemporizador() {
    if (this.juegoTerminado) return; 
    clearInterval(this.temporizador);
    this.juegoTerminado = true;
    await Swal.fire({
      icon: 'error',
      title: '¡Perdiste!',
      text: '¡Uy, no llegaste! Será la próxima',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
      customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      }).then(async()=>{
        this.router.navigate(['/juegos-vista']);
        const pedido = await this.firebase.obtenerPedidoPorUidUsuario(this.user.uid);

        await this.firebase.guardarDescuento(pedido, 0);

      });
  }

  inicializarCartas() {
    const duplicadas = [...this.imagenesOriginales, ...this.imagenesOriginales];
    this.cartas = this.mezclarArray(duplicadas).map(img => ({
      imagen: img,
      descubierta: false,
      emparejada: false
    }));
    this.cartasVolteadas = [];
    this.bloqueo = false;
  }

  mezclarArray(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
  }

  voltearCarta(indice: number) {
    const carta = this.cartas[indice];

    // No permitir clic si la carta ya está volteada/emparejada o si está bloqueado
    if (carta.descubierta || carta.emparejada || this.bloqueo || this.juegoTerminado) return;

    carta.descubierta = true;
    this.cartasVolteadas.push(indice);

    if (this.cartasVolteadas.length === 2) {
      this.bloqueo = true;
      const [i1, i2] = this.cartasVolteadas;
      const c1 = this.cartas[i1];
      const c2 = this.cartas[i2];

      if (c1.imagen === c2.imagen) {
        // Coinciden: se dejan descubiertas y marcamos como emparejadas
        c1.emparejada = true;
        c2.emparejada = true;
        this.limpiarVolteadas();
      } else {
        // No coinciden: tapar después de un delay
        setTimeout(() => {
          c1.descubierta = false;
          c2.descubierta = false;
          this.limpiarVolteadas();
        }, 1000);
      }
    }
  }

  async limpiarVolteadas() {
    this.cartasVolteadas = [];
    this.bloqueo = false;
    if (this.cartas.every(c => c.emparejada)) {
    this.detenerTemporizador();

    Swal.fire({
        icon: 'success',
        title: '¡Felicidades!',
        text: '¡Ganaste un descuento del 15% en tu compra!',
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
          await this.firebase.guardarDescuento(pedido, 15);
         

        }
        this.router.navigate(['/juegos-vista']);
      });
    }
  }

   irA(path:string)
  {
    this.mostrarOpciones = false;
    this.juegoTerminado = true;
    this.router.navigateByUrl(path);
  }

  
  cerrarSesion(){
  this.firebase.cerrarSesion();
  }

}
