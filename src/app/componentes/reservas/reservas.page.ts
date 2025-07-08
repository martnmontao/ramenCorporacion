import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Reserva } from 'src/app/interfaces/reserva';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
  standalone: false,
})
export class ReservasPage implements OnInit {

  reservaForm: FormGroup;
  user: any;
  usuarioLogueadoNombre: string | null = null; // Para guardar el nombre del usuario logueado
  usuarioLogueadoUid: string = "";
  minDate: string; // Para la validación de fecha mínima en el HTML

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService, private router: Router) {
    // Initialize minDate to today's date for date input validation
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD

    this.reservaForm = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      cantidadPersonas: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      notas: ['']
    });
  }

  async ngOnInit() {

          // Intentar obtener el nombre del usuario logueado para pre-llenar el campo
      
      this.user = await this.firebaseService.obtenerUsuarioLogueado();
      
      if (this.firebaseService.userId) { // Verifica si hay un usuario logueado
        try {
          const usuarioData = await this.firebaseService.obtenerUsuarioLogueado() as any;
          if (usuarioData?.nombreUsuario) {
            this.usuarioLogueadoNombre = usuarioData.nombreUsuario;
            this.usuarioLogueadoUid = usuarioData.uid;
            if (usuarioData.apellidoUsuario) {
              this.usuarioLogueadoNombre += ' ' + usuarioData.apellidoUsuario;
            }}
        } catch (error) {
                  console.error('Error al obtener datos del usuario logueado:', error);
                Swal.fire({
                icon: 'warning',
                title: 'Acceso Denegado',
                text: 'Debe iniciar sesión como cliente para realizar una reserva.',
                confirmButtonText: 'Aceptar',
                heightAuto: false,
                customClass: {
                  popup: 'mi-alerta',
                  confirmButton: 'btn-alerta',
                  title: 'titulo-alerta',
                  htmlContainer: 'texto-alerta'
                }
                  // Puedes decidir si mostrar un mensaje al usuario o simplemente no pre-llenar
              })
          }
  }
}

  async onSubmit(): Promise<void> {

    if (!this.validarFormulario()) return;
    if (!this.verificarUsuarioAutenticado()) return;

    const fechaHoraReserva = this.componerFechaHoraReserva();
    if (!this.validarFechaFutura(fechaHoraReserva)) return;

    const reserva = this.crearObjetoReserva(fechaHoraReserva);

    await this.enviarReserva(reserva);
/*     if (this.reservaForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Formulario',
        text: 'Por favor, complete todos los campos requeridos correctamente.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      return; 
    }

    if (!this.clienteUid) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario no Autenticado',
        text: 'Debe iniciar sesión para realizar una reserva.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      return;
    }

    const { fecha, hora, cantidadPersonas, notas } = this.reservaForm.value;
    const fechaHoraReserva = new Date(`${fecha}T${hora}:00`);

    // Validate that the reservation is in the future
    if (fechaHoraReserva <= new Date()) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha Inválida',
        text: 'La fecha y hora de la reserva deben ser en el futuro.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      return;
    }

    const nuevaReserva: Omit<Reserva, 'reservaId'> = {
      clienteUid: this.clienteUid,
      clienteNombre: this.clienteNombre || 'Cliente Desconocido',
      fechaHora: fechaHoraReserva,
      cantidadPersonas: cantidadPersonas,
      estado: 'pendiente', // Initial state
      notas: notas
    };

    try {
      await this.firebaseService.agregarReserva(nuevaReserva);
      this.reservaForm.reset(); // Clear form after successful submission
      // Reset validation states
      Object.keys(this.reservaForm.controls).forEach(key => {
        this.reservaForm.get(key)?.setErrors(null);
      });
    } catch (error) {
      console.error('Error al enviar la reserva:', error);
      // The FirebaseService already handles displaying a Swal error, so no need to repeat here.
    }
      */
  }

  private validarFormulario(): boolean {
  if (this.reservaForm.invalid) {
    Swal.fire({
      icon: 'error',
      title: 'Error de Formulario',
      text: 'Por favor, complete todos los campos requeridos correctamente.',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
      customClass: {
        popup: 'mi-alerta',
        confirmButton: 'btn-alerta',
        title: 'titulo-alerta',
        htmlContainer: 'texto-alerta'
      }
    });
    return false;
  }
  return true;
}
  private verificarUsuarioAutenticado(): boolean {
    if (!this.usuarioLogueadoUid) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario no Autenticado',
        text: 'Debe iniciar sesión para realizar una reserva.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      return false;
    }
    return true;
  }

  private componerFechaHoraReserva(): Date {
    const { fecha, hora } = this.reservaForm.value;
    return new Date(`${fecha}T${hora}:00`);
  }

  private validarFechaFutura(fechaHoraReserva: Date): boolean {
    if (fechaHoraReserva <= new Date()) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha Inválida',
        text: 'La fecha y hora de la reserva deben ser en el futuro.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      return false;
    }
    return true;
  }

  private crearObjetoReserva(fechaHora: Date): Omit<Reserva, 'reservaId'> {
    const { cantidadPersonas, notas } = this.reservaForm.value;
    return {
      clienteUid: this.usuarioLogueadoUid!,
      clienteNombre: this.usuarioLogueadoNombre || 'Cliente Desconocido',
      fechaHora: fechaHora,
      cantidadPersonas: cantidadPersonas,
      estado: 'pendiente',
      notas: notas
    };
  }

  private async enviarReserva(reserva: Omit<Reserva, 'reservaId'>): Promise<void> {
    try {
      await this.firebaseService.agregarReserva(reserva);
      this.reservaForm.reset();
      Object.keys(this.reservaForm.controls).forEach(key => {
        this.reservaForm.get(key)?.setErrors(null);
      });
      Swal.fire({
        icon: 'success',
        title: 'Reserva Realizada',
        text: 'Tu reserva fue registrada correctamente.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
    } catch (error) {
      console.error('Error al enviar la reserva:', error);
    }
}

}
