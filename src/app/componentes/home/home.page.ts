import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { QrService } from 'src/app/servicios/qr.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  
  private sub?: Subscription;
  verificarCliente = false;
  scanning = false;
  mostrarOpciones = false;
  user:any;
  isLoading = true;
  constructor(private router: Router, private firebaseService: FirebaseService, public qrService: QrService) { }

  async ngOnInit() {
    this.user = await this.firebaseService.obtenerUsuarioLogueado();
    this.verificarClienteEnMesa().then(respuesta => 
    {
      if(this.verificarCliente)
      {
        this.router.navigateByUrl('home-cliente');
      }
    }
    )

      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
  
  }

  irConQR() {
  this.qrService.StartScanYRedireccionar();
  }



  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  irA(path:string)
  {
    this.mostrarOpciones = false;

    this.router.navigateByUrl(path);
  }

  

  cerrarSesion(){
  this.firebaseService.cerrarSesion();
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