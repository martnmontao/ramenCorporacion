import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  mostrarOpciones = false;
  user:any;

  constructor(private router: Router, private firebaseService: FirebaseService) { }

  async ngOnInit() {
    this.user = await this.firebaseService.obtenerUsuarioLogueado();

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
