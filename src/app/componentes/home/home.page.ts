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
  scanning = false;
  mostrarOpciones = false;
  user:any;

  constructor(private router: Router, private firebaseService: FirebaseService, private qrService: QrService) { }

  async ngOnInit() {
    this.user = await this.firebaseService.obtenerUsuarioLogueado();

  }

  irConQR() {
  this.qrService.StartScanYRedireccionar();
}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  irA(path:string)
  {
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
}
