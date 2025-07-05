import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { QrService } from 'src/app/servicios/qr.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.page.html',
  styleUrls: ['./home-cliente.page.scss'],
  standalone: false,
})
export class HomeClientePage implements OnInit {
  mostrarOpciones = false;
  verificarCliente= false;
  user: any;
  verificarQr = false;
  
  constructor(private router: Router, private firebaseService: FirebaseService) { }

  async ngOnInit() {
      this.user = await this.firebaseService.obtenerUsuarioLogueado();

      await this.verificarClienteEnMesa();
  }
  
  
  irA(path:string)
  {
    this.mostrarOpciones = false;

    this.router.navigateByUrl(path);
  }

  verEstadisticasCliente(){
    this.router.navigate(['/estadisticas-encuesta']);
  }

  async accederEncuesta(){
    const encuestasRef = collection(this.firebaseService.firestore,'encuestas');
    const q = query(encuestasRef, where('uid','==',this.user.uid));
    const resultado = await getDocs(q);

    if(!resultado.empty){
      Swal.fire({
        icon: 'info',
        title: 'Encuesta ya completada',
        text: 'Ya has respondido esta encuesta. ¡Gracias por participar!',
        confirmButtonText: 'Aceptar',
        heightAuto: false
      });
      return;
    }
    this.router.navigate(['/encuesta-cliente']);
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
//34HoDbHVynOnCmC5ijz2RzX2BAV2
  cerrarSesion(){
  this.firebaseService.cerrarSesion();
  }

  async verificarClienteEnMesa()
  {
    const tieneMesa = await this.firebaseService.obtenerMesaPorUidUsuario(this.user.uid);
    //tieneMesa.qr == QrService.scan.result
      //this.verificarQr = true;
    if(tieneMesa != null)
    {

      this.verificarCliente = true;
    }
    

  }



}
