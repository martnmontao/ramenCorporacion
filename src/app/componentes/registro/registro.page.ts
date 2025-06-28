import { Component, OnInit } from '@angular/core';
import { Cliente } from 'src/app/interfaces/cliente';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; 
import { Router } from '@angular/router';
import { QrService } from 'src/app/servicios/qr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false
})
export class RegistroPage implements OnInit {

  mostrarOpciones = false;
  nombreUsuario: string = "";
  apellidoUsuario: string = "";
  documentoUsuario: string = "";
  cuilUsuario: string = "";
  perfilUsuario: string = "";
  emailUsuario: string = "";
  claveUsuario: string = "";
  fotoUsuario: string | undefined;
  mostrarAvisoAnonimo = false;
  fotosUsuario: string[] = [];
  mostrarInputs = false;
  opcionSeleccionada = "cliente";
  datosDocumentoQrSub!: Subscription;

  constructor(private firebaseService: FirebaseService, private router: Router, public qrService: QrService) { }

  ngOnInit() {
    this.datosDocumentoQrSub = this.qrService.datosEscaneados$.subscribe(data => {
        if (data) {
          this.nombreUsuario = data.nombre || '';
          this.apellidoUsuario = data.apellido || '';
          this.documentoUsuario = data.numero || '';
        }
      });
  }


  mostrarContenedores(contenedor: string)
  {
    switch(contenedor)
    {
      case "opciones":
        this.mostrarOpciones = !this.mostrarOpciones;
        break;
      case "aviso":
        this.mostrarAvisoAnonimo = !this.mostrarAvisoAnonimo;
        break;
    }
  }

 

  registrarUsuario()
  {
    console.log(this.fotoUsuario)
    let data;
    switch(this.opcionSeleccionada)
    {
      case "empleado":
        data = {
          nombreUsuario: this.nombreUsuario,
          apellidoUsuario: this.apellidoUsuario,
          documentoUsuario: this.documentoUsuario,
          perfil: this.opcionSeleccionada,
          tipo: this.perfilUsuario,
          cuil: this.cuilUsuario,
          imagenUsuario: this.fotoUsuario,
          autorizado: false
        }
        break;
      case "gerencia":
        data = {
          nombreUsuario: this.nombreUsuario,
          apellidoUsuario: this.apellidoUsuario,
          documentoUsuario: this.documentoUsuario,
          perfil: this.opcionSeleccionada,
          tipo: this.perfilUsuario,
          cuil: this.cuilUsuario,
          imagenUsuario: this.fotoUsuario,
          autorizado: false


        }
        break;
      default:
        data = {
          nombreUsuario: this.nombreUsuario,
          apellidoUsuario: this.apellidoUsuario,
          documentoUsuario: this.documentoUsuario,
          perfil: this.opcionSeleccionada,
          imagenUsuario: this.fotoUsuario,
          autorizado: false

        }
    }
  
    try
    {
     this.firebaseService.agregarDocumento(data, "registro");
    }
    catch(error)
    {
      console.log(error);
    }
  }

   async tomarFoto() 
   {
    const image = await Camera.getPhoto({
      quality: 10,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    this.fotoUsuario = "data:image/jpeg;base64," + image.base64String;
    
    this.fotosUsuario.push(this.fotoUsuario);

  }

  confirmarRegistroAnonimo()
  {
    let data = 
    {
      imagen: this.fotoUsuario,
      nombre: this.nombreUsuario,
      perfil: "cliente"
    }

    this.firebaseService.agregarDocumento(data, "registro");
  }

   irA()
  {
    this.router.navigateByUrl('login');
    this.mostrarOpciones = false;
    this.nombreUsuario = "";
    this.apellidoUsuario = "";
    this.cuilUsuario = "";
    this.documentoUsuario = "";
  }

  seleccionarOpcionesRegistro(opcion: string)
  {
    switch(opcion)
    {
      case "gerencia":
        this.mostrarInputs = true;
        this.opcionSeleccionada = "gerencia";
        break;
      case "empleado":
        this.mostrarInputs = true;
        this.opcionSeleccionada = "empleado";

        break;
      default:
        this.mostrarInputs = false;
        this.opcionSeleccionada = "cliente";
        break;
    }
  }

  async scanearDocumento() 
  {
    await this.qrService.StartScan();    
  }


 
}
