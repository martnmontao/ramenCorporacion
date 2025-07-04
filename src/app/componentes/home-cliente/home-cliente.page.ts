import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { QrService } from 'src/app/servicios/qr.service';

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
