import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController } from '@ionic/angular';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';

export interface Duenio{
  email: string
  nombre: string,
  apellido: string,
  dni: number,
  cuit: number,
  imagenBase64: string,
  perfil: 'duenio' | 'supervisor',
}

@Component({
  selector: 'app-alta-duenio',
  templateUrl: './alta-duenio.page.html',
  styleUrls: ['./alta-duenio.page.scss'],
  standalone: false
})
export class AltaDuenioPage implements OnInit {
  mostrarOpciones = false;
  nombreUsuario: string = "";
  apellidoUsuario: string = "";
  documentoUsuario: string = "";
  fotoUsuario: string | undefined;
  mostrarAvisoAnonimo = false;
  fotos: any;
  loading = false;
  photo: string | undefined;

  duenio: Duenio = {
    email: '',
    nombre: '',
    apellido: '',
    dni: 0,
    cuit: 0,
    imagenBase64: '',
    perfil: 'duenio',
    
  };


  constructor(private firebaseService: FirebaseService,     
    private loadingController: LoadingController,
    private router:Router) { }

  ngOnInit() {}

    async tomarFoto() {
    this.loading = true;
    try {
      const image = await Camera.getPhoto({
        quality: 20,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      const fotoBase64 = image.dataUrl;

      if (fotoBase64) {
        const loading = await this.loadingController.create({
          message: 'Subiendo foto...',
        });
        await loading.present();

        await this.firebaseService.subirFoto(fotoBase64);

        await loading.dismiss();
        this.loading = false;
      } else {
        throw new Error('No se obtuvo imagen en base64');
      }
    } catch (error: any) {
      this.loading = false;
      console.error('Error al subir foto:', error);
      Swal.fire({
                        icon: 'error', 
                        title: 'Error al subir la foto.',
                        text: 'Ocurrio un error y no se subio tu foto. Por favor, volvé a intentarlo.', 
                        confirmButtonText: 'Aceptar',
                        background: '#FFA5AB',
                        heightAuto: false 
                      });
    }
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


  async guardarDuenio() {
  if (!this.photo) return;

  const loading = await this.loadingController.create({
    message: 'Guardando dueño...',
  });
  await loading.present();

  try {
    this.duenio.imagenBase64 = this.photo!;
    await this.firebaseService.guardarDuenio(this.duenio);

    await loading.dismiss();
    Swal.fire({
      icon: 'success',
      title: '¡Dueño guardado!',
      confirmButtonText: 'Aceptar',
      background: '#C4F1BE',
      heightAuto: false
    });
    this.router.navigateByUrl('home');
  } catch (error) {
    await loading.dismiss();
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: 'Ocurrió un problema al guardar el usuario.',
      background: '#FFA5AB',
      heightAuto: false
    });
  }
}


  irAhome() {
    this.router.navigateByUrl('home')
  }


cerrarSesion() {
  this.firebaseService.cerrarSesion();
}


}

