import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encuesta-cliente',
  templateUrl: './encuesta-cliente.page.html',
  styleUrls: ['./encuesta-cliente.page.scss'],
  standalone:false,
})
export class EncuestaClientePage implements OnInit{

  encuestaClienteForm! : FormGroup;
  fBuilder = inject(FormBuilder);
  imagenesBase64: string[] = [];

  mostrarOpciones = false;
  user: any;
  nombreUsuario = "";
  apellidoUsuario = "";
  constructor(private firebase: FirebaseService, private toast: ToastController, private router: Router) { 
   
   
    this.encuestaClienteForm = this.fBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      preguntaRdo: [''],
      preguntaRange: [3, Validators.required],
      preguntaSelect:['', Validators.required],
      preguntaInput:['', Validators.required],
      imagenes:[null],
      preguntaChk: this.fBuilder.group({
        facilidad: [false],
        variedad:[false],
        tiempo: [false],
        atencion: [false],
        promos:[false],
      })
    });
  }

  async ngOnInit() {
    this.user = await this.firebase.obtenerUsuarioLogueado()
    this.nombreUsuario = this.user.nombreUsuario;
    this.apellidoUsuario = this.user.apellidoUsuario;
  }

  onFileChange(event: any){
    const files: FileList = event.target.files;
    if(files.length > 3){
      this.mostrarToast('Solo podés subir hasta 3 imagenes');
      return;
    }

    this.imagenesBase64 = [];
    const archivos = Array.from(files);
    let leidos = 0;

    archivos.forEach((archivo) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.imagenesBase64.push(base64);
        leidos++;
        if(leidos === archivos.length){
          this.encuestaClienteForm.patchValue({imagenes: this.imagenesBase64});
        }
      };
      reader.readAsDataURL(archivo);
    });
  }

  async enviarEncuesta(){
    const usuarioActual = this.firebase.getUsuarioActual();
    if(this.encuestaClienteForm.valid){
      const datos = {
        ...this.encuestaClienteForm.value,
        tipo:'cliente',
        uid:usuarioActual?.uid}
      try{
        await this.firebase.guardarEncuesta(datos);
        this.mostrarToast('¡¡Encuesta enviada con éxito!!');
        this.encuestaClienteForm.reset();
        this.imagenesBase64 = [];
        this.router.navigateByUrl('home-cliente');
      }catch(error){
        this.mostrarToast('Error al enviar la encuesta');
      }
    }else {
      this.mostrarToast('Completá todos los campos');
    }
    return;
  }

  async mostrarToast(mensaje: string){
    const toastMensaje = await this.toast.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      buttons: [{ text: 'ACEPTAR', role: 'cancel' }],
      cssClass: 'mi-toast-custom'
    });
    await toastMensaje.present();
  }

   irA(path:string)
  {
    this.mostrarOpciones = false;

    this.router.navigateByUrl(path);
  }

  

  cerrarSesion(){
  this.firebase.cerrarSesion();
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
