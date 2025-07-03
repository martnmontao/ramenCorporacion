import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-encuesta-empleado',
  standalone:false,
  templateUrl: './encuesta-empleado.page.html',
  styleUrls: ['./encuesta-empleado.page.scss'],
})
export class EncuestaEmpleadoPage implements OnInit{

  encuestaEmpleadoForm! : FormGroup;
  fBuilder = inject(FormBuilder);
  mostrarEncuesta = true;
  imagenBase64: string | null = null;

  constructor(private firebase: FirebaseService, private toast: ToastController) {
      this.encuestaEmpleadoForm = this.fBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      preguntaRdo: [''],
      preguntaRange: [5, Validators.required],
      preguntaSelect:['', Validators.required],
      preguntaInput:['', Validators.required],
      imagen:[null, Validators.required],
      preguntaChk: this.fBuilder.group({
        cables: [false],
        liquidos:[false],
        objetos: [false],
        maquinas: [false],
        ninguno:[false],
      })
    });
  }

  ngOnInit(): void {
    const chkGroup = this.encuestaEmpleadoForm.get('preguntaChk') as FormGroup;

    chkGroup.get('ninguno')?.valueChanges.subscribe((ningunoMarcado: boolean) => {
      if (ningunoMarcado) {
        // Si se marca "ninguno", desmarcar todos los otros
        Object.keys(chkGroup.controls).forEach(key => {
          if (key !== 'ninguno') {
            chkGroup.get(key)?.setValue(false, { emitEvent: false });
          }
        });
      }
    });

    ['cables', 'liquidos', 'objetos', 'maquinas'].forEach(field => {
      chkGroup.get(field)?.valueChanges.subscribe((valor: boolean) => {
        if (valor) {
          chkGroup.get('ninguno')?.setValue(false, { emitEvent: false });
        }
      });
    });
  }

  onFileChange(event: any) {
    const file: File = event.target.files[0];

    if(!file){
      this.imagenBase64 = null;
      this.encuestaEmpleadoForm.patchValue({imagen: null});
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagenBase64 = reader.result as string;
      this.encuestaEmpleadoForm.patchValue({imagen: this.imagenBase64});
    };
    reader.readAsDataURL(file);
  }

  async enviarEncuesta(){
    if(this.encuestaEmpleadoForm.valid){
      const datos = this.encuestaEmpleadoForm.value;
      datos.preguntaRange = Number(datos.preguntaRange);
      
      try{
        await this.firebase.guardarEncuesta(datos);
        this.mostrarToast('¡¡Encuesta enviada con éxito!!');
        this.encuestaEmpleadoForm.reset();
        this.imagenBase64 = null;
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
      duration:3000,
      position:'bottom',
      buttons:[{text:'OK', role:'cancel'}],
    });
    await toastMensaje.present();
  }

  omitirEncuesta(){
    this.mostrarEncuesta = false;
  }


}
