import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';

@Component({
  selector: 'app-juegos-vista',
  templateUrl: './juegos-vista.page.html',
  standalone:false,
  styleUrls: ['./juegos-vista.page.scss'],
})
export class JuegosVistaPage implements OnInit {
  mostrarOpciones = false;

  constructor(private firebaseService: FirebaseService) { }

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

  jugar10(){
    
  }

  jugar15(){}

  jugar20(){}

  cerrarSesion(){
  this.firebaseService.cerrarSesion();
  }

}
