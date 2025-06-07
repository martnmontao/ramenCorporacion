import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  iniciar: string = "";
  constructor(private firebaseService: FirebaseService) { }

  ngOnInit() {
  }


  iniciarSesion()
  {
    this.firebaseService.acceder("emi@emi.com", "emi123").then(respuesta => 
    {
      this.iniciar = "INICIADO";
    }
    );
  }


}
