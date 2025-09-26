import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-juegos-vista',
  templateUrl: './juegos-vista.page.html',
  standalone:false,
  styleUrls: ['./juegos-vista.page.scss'],
})
export class JuegosVistaPage implements OnInit {
  mostrarOpciones = false;

  constructor(private router: Router, private firebaseService: FirebaseService) { }

  ngOnInit() {
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

    irA(path:string)
  {
    this.mostrarOpciones = false;

    this.router.navigateByUrl(path);
  }

  jugar10(){
    
  }

  jugar15(){}

  jugar20(){}

  cerrarSesion(){
  this.firebaseService.cerrarSesion();
  }

}
