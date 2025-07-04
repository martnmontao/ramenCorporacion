import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesServiceService } from 'src/app/servicios/notificaciones-service.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; 
import { Router } from '@angular/router';
import { QrService } from 'src/app/servicios/qr.service';
import { Subscription } from 'rxjs';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  imports:[FormsModule,ReactiveFormsModule, IonicModule,CommonModule],
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true
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
  
  registroForm! : FormGroup;

  constructor(private firebaseService: FirebaseService, private notificacionesService : NotificacionesServiceService,
  private router: Router, public qrService: QrService,private toast: ToastController) {}

  ngOnInit() {

    this.registroForm = new FormGroup({
      nombre: new FormControl('', Validators.required),
      apellido: new FormControl('', Validators.required),
      documento: new FormControl('', [Validators.required, Validators.maxLength(8), Validators.pattern('^[0-9]+$')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      clave: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });

    this.datosDocumentoQrSub = this.qrService.datosEscaneados$.subscribe(data => {
        if (data) {
          this.registroForm.patchValue({
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            documento: data.numero || ''
          });
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

  obtenerPrimerError(): string | null {
    /* En esta función se van a devolver los errores que se encuentren
    para registrar al usuario, más que nada formatos de datos u obligación de poner datos
    también se va a validar que al seleccionar un usuario de tipo "Empleado" o "gerencia"
    se ingrese el tipo de perfil correcto */

    const controls = this.registroForm.controls;

    for(const key in controls){
      const control = controls[key];
      if(control.errors?.['required']){
        return '⚠ Todos los campos son obligatorios. Completar ⚠';
      }
    }

    if(controls['email'].errors?.['email']){
      return 'El correo electrónico no es válido';
    }

    if(controls['clave'].errors?.['minlength']){
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    if(controls['documento'].errors?.['maxlength']){
      return 'El DNI contiene un máximo de 8 NÚMEROS';
    } else if(controls['documento'].errors?.['pattern']){
      return 'El campo DNI debe contener SOLO NÚMEROS';
    }

    if (controls['cuil']?.errors?.['dniNoCoincide']) {
      return 'La parte del medio del CUIL debe coincidir con el DNI ingresado.';
    }

    if (controls['cuil']?.errors?.['pattern']) {
      return 'El CUIL debe tener el formato XX-XXXXXXXX-X.';
    }


  if (this.opcionSeleccionada !== 'cliente') {
  const perfil = controls['perfil'].value?.toLowerCase();

    if (this.opcionSeleccionada === 'empleado') {
      const perfilesValidos = ['mozo', 'cocinero', 'maitre','bartender'];
      if (!perfilesValidos.includes(perfil)) {
        return 'Perfil inválido para empleado.';
      }
    }

    if (this.opcionSeleccionada === 'gerencia') {
      const perfilesValidos = ['supervisor', 'dueño'];
      if (!perfilesValidos.includes(perfil)) {
        return 'Perfil inválido para gerencia.';
      }
    }
  }

    return null;
  }

  async mostrarToast(mensaje: string){
    /*Formato en que se tienen que mostrar los mensajes tipo Toast */
    const toastMensaje = await this.toast.create({
      message: mensaje,
      duration:3000,
      position:'top',
      buttons:[{text:'OK', role:'cancel'}],
    });

    await toastMensaje.present();
  }

  async registrarUsuario() 
  /*Esta función maneja el registro a partir de que completamos el form:
  1- toca todos los elementos del form a ver si detecta un error
  2- Si hay algún error, lo va a mostrar en orden cada uno hasta que se vayan resolviendo
  3- Se verifica la existencia de una foto
  4- Se verifica si no hay algún dato de identificación duplicado con algún otro registro
  5- Los datos verificados se envían a la base de datos (incluido el token del usuario para notificaciones)
  6- Aparece un mensaje tipo SweetAlert con mensaje de éxito o fracaso(error)
   */
  {
    this.registroForm.markAllAsTouched();

    const primerError = this.obtenerPrimerError();
    if(primerError){
      await this.mostrarToast(primerError);
      return;
    }

    if (!this.fotoUsuario) {
      await this.mostrarToast('⚠ Debe tomarse una foto antes de registrarse.');
      return;
    }

    const valores = this.registroForm.value;
    const token = this.notificacionesService.getToken();

    try{
      const mensajeError = await this.firebaseService.verificarExistentesRegistro(
        valores.email,
        valores.documento,
        this.mostrarInputs ? valores.cuil : undefined
      );

      if(mensajeError){
        await this.mostrarToast(mensajeError);
        return;
      }

      let data: any = {
      nombreUsuario: valores.nombre,
      apellidoUsuario: valores.apellido,
      documentoUsuario: valores.documento,
      correoUsuario: valores.email,
      claveUsuario: valores.clave,
      perfil: this.opcionSeleccionada,
      imagenUsuario: this.fotoUsuario,
      autorizado: false,
      tokenUsuario: token
      };

      if (this.mostrarInputs) {
        data = {
          ...data,
          cuil: valores.cuil,
          tipo: valores.perfil
        };
      }

      await this.firebaseService.agregarDocumento(data, 'registro');
      Swal.fire({
      icon: 'success',
      title: '¡Registro exitoso!',
      text: 'Queda esperar la autorización.',
      confirmButtonText: 'Aceptar',
      heightAuto: false
      });
      this.registroForm.reset();
      this.fotoUsuario = undefined;
      this.opcionSeleccionada = 'cliente';
      this.mostrarInputs = false;
    }catch(error){
      console.error(error);
      Swal.fire({
      icon: 'error',
      title: '¡Error inesperado!',
      text: 'Intentá de nuevo',
      confirmButtonText: 'Aceptar',
      heightAuto: false
      });
    }
  }


  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 10,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    this.fotoUsuario = "data:image/jpeg;base64," + image.base64String;
    
    this.fotosUsuario.push(this.fotoUsuario);

    await this.mostrarToast('¡Foto tomada correctamente!📸');
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
    /*Esta función nos asegura que al momento de elegir un tipo de cuenta
    para registrar, no se tomen en cuenta los input que no corresponden a dicha cuenta
    Ejemplo: si queremos crear un cliente, no se deben tomar en cuenta los input CUIL o perfil.
    Si creamos una cuenta empleado, se tomaran en cuenta los input con sus 
    respectivas validaciones */
  {
    this.opcionSeleccionada = opcion;

    if(opcion == 'cliente'){
      this.mostrarInputs = false;
      this.registroForm.removeControl('cuil');
      this.registroForm.removeControl('perfil');
    }else {
      this.mostrarInputs = true;

      if(!this.registroForm.contains('cuil')){
        this.registroForm.addControl('cuil', new FormControl<string>('',{
          nonNullable: true,
          validators:[
          Validators.required,
          Validators.pattern(/^\d{2}-\d{8}-\d{1}$/),
          this.validarCuilConDni.bind(this)
          ]
        })
      );
    }

    if(!this.registroForm.contains('perfil')){
        this.registroForm.addControl('perfil', new FormControl('', Validators.required));
      }
    }
  }

  validarCuilConDni(control: AbstractControl){
    /* El formato de un cuil debe ser NN-[dniDelUsuario]-N. Esta función verifica
    que esto del dni y su presencia en el cuil esté */
    const cuil = control.value;
    const documento = this.registroForm?.get('documento')?.value;

    if(!cuil || !documento) return null;

    const partes = cuil.split('-');
    if(partes.length !== 3) return { cuilInvalido: true};

    const dniCuil = partes[1];
    if (dniCuil !== documento){
      return {dniNoCoincide: true};
    }

    return null;
  }

  formatearCuil(){
    /*Esta función nos escribe el cuil con guiones. es decir en formato: NN-NNNNNN-N */
    const control = this.registroForm.get('cuil');
    if(!control) return;

    let valor = control.value?.replace(/\D/g, '');
    if(valor.length > 11){
      valor = valor.slice(0,11);
    }

    let formateado = valor;
    if(valor.length >= 3 && valor.length <= 10){
      formateado = `${valor.slice(0, 2)}-${valor.slice(2)}`;
    }else if(valor.length > 10) {
      formateado = `${valor.slice(0, 2)}-${valor.slice(2, 10)}-${valor.slice(10)}`;
    }

    if(formateado !== control.value){
      control.setValue(formateado, {emitEvent : false});
    }
  }

  async scanearDocumento() 
  {
    await this.qrService.StartScan();    
  }


}
