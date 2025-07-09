import { Component, OnInit } from '@angular/core';
import { interval, startWith, Subscription, switchMap } from 'rxjs';
import { Mesa } from 'src/app/interfaces/mesa';
import { Reserva } from 'src/app/interfaces/reserva';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-reservas',
  templateUrl: './gestion-reservas.page.html',
  styleUrls: ['./gestion-reservas.page.scss'],
  standalone: false
})
export class GestionReservasPage implements OnInit {
  reservasPendientes: Reserva[] = [];
  reservasConfirmadas: Reserva[] = [];
  mesasDisponibles: Mesa[] = []; // These are truly 'disponible' mesas for assignment
  selectedMesaId: string | null = null;
  private subscriptions: Subscription = new Subscription();
  private readonly MAX_WAIT_TIME_MINUTES = 15; // Tiempo máximo de espera para que el cliente llegue después de la hora de reserva

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit(): void {
    // Suscribirse a las reservas pendientes
    this.subscriptions.add(
      this.firebaseService.obtenerReservasPendientes().subscribe(
        (reservas) => {
          this.reservasPendientes = reservas;
        },
        (error) => {
          console.error('Error al obtener reservas pendientes:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las reservas pendientes.',
            confirmButtonText: 'Aceptar',
            heightAuto: false,
            customClass: {
              popup: 'mi-alerta',
              confirmButton: 'btn-alerta',
              title: 'titulo-alerta',
              htmlContainer: 'texto-alerta'
            }
          });
        }
      )
    );

    // Suscribirse a las mesas disponibles
    this.subscriptions.add(
      this.firebaseService.obtenerMesasDisponibles().subscribe(
        (mesas) => {
          this.mesasDisponibles = mesas;
        },
        (error) => {
          console.error('Error al obtener mesas disponibles:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las mesas disponibles.',
            confirmButtonText: 'Aceptar',
            heightAuto: false,
            customClass: {
              popup: 'mi-alerta',
              confirmButton: 'btn-alerta',
              title: 'titulo-alerta',
              htmlContainer: 'texto-alerta'
            }
          });
        }
      )
    );

    // Suscribirse a las reservas confirmadas y verificar expiración cada minuto
    this.subscriptions.add(
      interval(60000) // Check every minute
        .pipe(
          startWith(0), // Emit immediately on component load
          // Fetch all reservations (not just for a specific client) to check for expiration
          // This assumes the supervisor needs to monitor all confirmed reservations.
          // If you have a specific way to filter supervisor's view, adjust this query.
          switchMap(() => this.firebaseService.getCollection<Reserva>('reservas', 'estado', 'confirmada'))
        )
        .subscribe(
          (reservas) => {
            this.reservasConfirmadas = reservas.map(reserva => ({
              ...reserva,
              fechaHora: (reserva.fechaHora instanceof Date) ? reserva.fechaHora : (reserva.fechaHora as any).toDate(),
              horaConfirmacion: (reserva.horaConfirmacion instanceof Date) ? reserva.horaConfirmacion : (reserva.horaConfirmacion as any)?.toDate()
            }));
            this.checkExpiredReservations();
          },
          (error) => {
            console.error('Error al obtener reservas confirmadas:', error);
          }
        )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Unsubscribe all subscriptions to prevent memory leaks
  }

  /**
   * Confirma una reserva y le asigna una mesa.
   * @param reserva La reserva a confirmar.
   */
  async confirmarReserva(reserva: Reserva): Promise<void> {
    if (!this.selectedMesaId) {
      Swal.fire({
        icon: 'warning',
        title: 'Mesa No Seleccionada',
        text: 'Por favor, seleccione una mesa para confirmar la reserva.',
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

    // Verificar que la fecha y hora de la reserva sean futuras
    if (new Date(reserva.fechaHora) <= new Date()) {
      Swal.fire({
        icon: 'error',
        title: 'Reserva Caducada',
        text: 'Esta reserva ya no puede ser confirmada porque su fecha y hora han pasado.',
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

    try {
      await this.firebaseService.confirmarReserva(reserva.reservaId!, this.selectedMesaId);
      this.selectedMesaId = null; // Reset selected mesa
    } catch (error) {
      // Error handling is already in FirebaseService
    }
  }

  /**
   * Cancela una reserva.
   * @param reservaId El ID de la reserva a cancelar.
   */
  async cancelarReserva(reservaId: string): Promise<void> {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción cancelará la reserva de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      heightAuto: false,
      customClass: {
        popup: 'mi-alerta',
        confirmButton: 'btn-alerta',
        cancelButton: 'btn-alerta-cancel',
        title: 'titulo-alerta',
        htmlContainer: 'texto-alerta'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.firebaseService.cancelarReserva(reservaId);
        } catch (error) {
          // Error handling is already in FirebaseService
        }
      }
    });
  }

  /**
   * Verifica y expira las reservas confirmadas si el tiempo de espera ha pasado.
   */
  private async checkExpiredReservations(): Promise<void> {
    const now = new Date();
    for (const reserva of this.reservasConfirmadas) {
      if (reserva.horaConfirmacion) {
        const timeElapsed = now.getTime() - reserva.horaConfirmacion.getTime();
        const maxWaitTimeMs = this.MAX_WAIT_TIME_MINUTES * 60 * 1000;

        if (timeElapsed > maxWaitTimeMs) {
          // If the reservation is past its confirmed time + max wait time, expire it
          await this.firebaseService.expirarReserva(reserva.reservaId!);
        }
      }
    }
  }

  /**
   * Helper para formatear la fecha y hora.
   * @param date La fecha a formatear.
   * @returns La fecha y hora formateadas.
   */
  formatDateTime(date: Date): string {
    if (!date) return 'N/A';
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Helper para obtener el número de mesa a partir de su ID.
   * @param mesaId El ID de la mesa.
   * @returns El número de mesa o 'N/A' si no se encuentra.
   */
  getMesaNumero(mesaId: string | undefined): string {
    if (!mesaId) {
      return 'N/A';
    }
    const mesa = this.mesasDisponibles.find(m => m.mesaId === mesaId);
    return mesa ? mesa.numeroMesa.toString() : 'N/A';
  }
}
