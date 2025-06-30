import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.page.html',
  styleUrls: ['./home-cliente.page.scss'],
  standalone: false,
})
export class HomeClientePage implements OnInit {

  mostrarOpciones = false;

  constructor(private router: Router, private firebaseService: FirebaseService) { }

  ngOnInit() {
  }
  
  
  irA(path:string)
  {
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

  cerrarSesion(){
  this.firebaseService.cerrarSesion();
  }

}
