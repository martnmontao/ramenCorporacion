import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteEnEspera } from 'src/app/interfaces/clienteEnEspera';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitar-mesa',
  templateUrl: './solicitar-mesa.page.html',
  styleUrls: ['./solicitar-mesa.page.scss'],
  standalone: false
})
export class SolicitarMesaPage implements OnInit {

  solicitudMesaForm: FormGroup;
  solicitudEnviada: boolean = false;
  usuarioLogueadoNombre: string | null = null; // Para guardar el nombre del usuario logueado
  usuarioLogueadoUid: string = "";

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService
  ) {
    this.solicitudMesaForm = this.fb.group({
      nombre: ['', Validators.required],
      cantidadPersonas: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      telefono: ['', [Validators.pattern('^[0-9]{8,15}$')]],
    });
  }

  async ngOnInit() {
    // Intentar obtener el nombre del usuario logueado para pre-llenar el campo
    if (this.firebaseService.userId) { // Verifica si hay un usuario logueado
      try {
        const usuarioData = await this.firebaseService.obtenerUsuarioLogueado() as any;
        if (usuarioData?.nombreUsuario) {
          this.usuarioLogueadoNombre = usuarioData.nombreUsuario;
          this.usuarioLogueadoUid = usuarioData.uid;
          if (usuarioData.apellidoUsuario) {
            this.usuarioLogueadoNombre += ' ' + usuarioData.apellidoUsuario;
          }

          this.solicitudMesaForm.patchValue({
            nombre: this.usuarioLogueadoNombre,
            telefono: usuarioData.documentoUsuario ?? '' // si querés precargar también el DNI como teléfono opcional
          });}
      } catch (error) {
                console.error('Error al obtener datos del usuario logueado:', error);
                // Puedes decidir si mostrar un mensaje al usuario o simplemente no pre-llenar
            }
        }
}

  async onSubmit() {
    if (this.solicitudMesaForm.valid) {
      const datosFormulario = this.solicitudMesaForm.value;

      const nuevoClienteEnEspera: Omit<ClienteEnEspera, 'id'> = {
        nombre: datosFormulario.nombre,
        cantidadPersonas: datosFormulario.cantidadPersonas,
        telefono: datosFormulario.telefono || '',
        horaLlegada: new Date(),
        estado: 'esperando',
        usuarioUid: this.usuarioLogueadoUid
      };

      try {
        await this.firebaseService.agregarClienteEnEspera(nuevoClienteEnEspera);
        this.solicitudEnviada = true;
        this.solicitudMesaForm.reset(); // Limpia el formulario
        // Opcional: Volver a pre-llenar el nombre si el usuario decide hacer otra solicitud sin desloguearse
        if (this.usuarioLogueadoNombre) {
          this.solicitudMesaForm.patchValue({ nombre: this.usuarioLogueadoNombre });
        }


        Swal.fire({
          icon: 'success',
          title: '¡Solicitud Enviada!',
          text: 'Hemos recibido tu solicitud. Te notificaremos cuando tu mesa esté lista. ¡Gracias!',
          confirmButtonText: 'Entendido',
          heightAuto: false
        });

      } catch (error) {
        console.error('Error al solicitar mesa:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al solicitar',
          text: 'No pudimos procesar tu solicitud en este momento. Por favor, inténtalo de nuevo.',
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
        this.solicitudEnviada = false;
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Datos Incompletos',
        text: 'Por favor, completa todos los campos requeridos correctamente.',
        confirmButtonText: 'Aceptar',
        heightAuto: false
      });
      this.solicitudMesaForm.markAllAsTouched();
    }
  }

  get formControls() {
    return this.solicitudMesaForm.controls;
  }

  nuevaSolicitud() {
    this.solicitudEnviada = false;
    this.solicitudMesaForm.reset();
    // Vuelve a pre-llenar el nombre si hay un usuario logueado
    if (this.usuarioLogueadoNombre) {
      this.solicitudMesaForm.patchValue({ nombre: this.usuarioLogueadoNombre });
    }
  }

}
