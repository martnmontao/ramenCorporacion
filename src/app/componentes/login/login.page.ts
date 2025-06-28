import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  rolSeleccionado: string = "";
  mostrarOpciones = false;
  claveUsuario: string = "";
  emailUsuario: string = "";

  mostrarOpcionesIngresos = false;
  datosDocumentoQrSub!: Subscription;
  roles: string[] = [
  'Dueño',
  'Supervisor',
  'Maître',
  'Cocinero',
  'Bartender',
  'Mozo',
  'Cliente R',
  'Cliente A'
];
  constructor(private firebaseService: FirebaseService, private router: Router) { }

  ngOnInit() {

  }


    mostrarContenedores(contenedor: string)
  {
    switch(contenedor)
    {
      case "opciones":
        this.mostrarOpciones = !this.mostrarOpciones;
        break;
      case "ingresos":
        this.mostrarOpcionesIngresos = !this.mostrarOpcionesIngresos;
        break;
    }
  }


  irA()
  {


    this.mostrarOpciones = false;
    this.router.navigateByUrl('registro');

  }

  seleccionarRol(rol: string): void 
  {
    this.rolSeleccionado = rol;
  }



  
  iniciarSesion()
  {
    this.firebaseService.acceder(this.emailUsuario, this.claveUsuario).then(respuesta => 
    {
      this.router.navigateByUrl("home");
    }
    )
  }

  inicioSesionRapido(usuario: string)
  {
    console.log(usuario);
    switch(usuario)
    {
      case "Dueño":
        this.emailUsuario = "martin@gmail.com";
        this.claveUsuario = "martin123";
        break;
      case "Maître":
        this.emailUsuario = "agustina@gmail.com";
        this.claveUsuario = "agus123";
        break;
      case "Cliente R":
        this.emailUsuario = "octavio@gmail.com";
        this.claveUsuario = "octavio123";
        break;
    }
  }

  


}
