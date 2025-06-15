import { Component, OnInit } from '@angular/core';
import { Cliente } from 'src/app/interfaces/cliente';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; 
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
  fotoUsuario: string | undefined;
  mostrarAvisoAnonimo = false;

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
      case "aviso":
        this.mostrarAvisoAnonimo = !this.mostrarAvisoAnonimo;
        break;
    }
  }

 

  registrarUsuario()
  {
    let data = {
      nombreUsuario: this.nombreUsuario,
      apelliidoUsuario: this.apellidoUsuario,
      documentoUsuario: this.documentoUsuario
    }
   

    try
    {
     this.firebaseService.agregarDocumento(data, "registro");
    }
    catch(error)
    {

    }
  }

   async tomarFoto() 
   {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    this.fotoUsuario = image.dataUrl!;
  }

}
