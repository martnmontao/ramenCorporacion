import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ClienteEnEspera } from 'src/app/interfaces/clienteEnEspera';
import { Mesa } from 'src/app/interfaces/mesa';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-espera',
  templateUrl: './lista-espera.page.html',
  styleUrls: ['./lista-espera.page.scss'],
  standalone: false,
})
export class ListaEsperaPage implements OnInit {

mesasDisponibles$: Observable<Mesa[]>;
  clientesEnEspera$: Observable<ClienteEnEspera[]>;

  selectedClient: ClienteEnEspera | null = null;
  selectedMesa: Mesa | null = null;


  private mesaSubscription: Subscription | undefined;
  private clienteSubscription: Subscription | undefined;

  constructor(private firebaseService: FirebaseService) {
    // Inicializamos los observables aquí.
    // Usamos el método obtenerMesas con el filtro 'disponible'.
    this.mesasDisponibles$ = this.firebaseService.obtenerMesas('disponible');
    // Usamos el método obtenerClientesEnEspera con el filtro 'esperando'.

    this.clientesEnEspera$ = this.firebaseService.obtenerClientesEnEspera('esperando');
    console.log("clientes en espera: ", this.clientesEnEspera$)
  }

  ngOnInit() {

    this.mesaSubscription = this.mesasDisponibles$.subscribe(mesas => {
      console.log('Mesas disponibles:', mesas);
    });
    this.clienteSubscription = this.clientesEnEspera$.subscribe(clientes => {
      console.log('Clientes en espera:', clientes);
    });

  }

  // Método para manejar la selección de un cliente
  seleccionarCliente(cliente: ClienteEnEspera) {
    this.selectedClient = cliente;
    console.log('Cliente seleccionado:', this.selectedClient);
  }

  // Método para manejar la selección de una mesa
  seleccionarMesa(mesa: Mesa) {
    this.selectedMesa = mesa;
    console.log('Mesa seleccionada:', this.selectedMesa);
  }

  // Método para realizar la asignación
  async asignarMesa() {
    if (!this.selectedClient || !this.selectedMesa) {
      Swal.fire({
        icon: 'warning',
        title: 'Asignación incompleta',
        text: 'Por favor, selecciona un cliente y una mesa disponible.',
        confirmButtonText: 'Aceptar',
        heightAuto: false
      });
      return;
    }

    // Confirmación antes de asignar
    const confirmacion = await Swal.fire({
      title: '¿Confirmar asignación?',
      text: `¿Asignar a ${this.selectedClient.nombre} a la mesa ${this.selectedMesa.numeroMesa}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, asignar',
      cancelButtonText: 'Cancelar',
      heightAuto: false
    });

    if (confirmacion.isConfirmed) {
      try {
        // 1. Actualizar el estado de la mesa a 'ocupada' y asignar el cliente
        await this.firebaseService.actualizarMesa(this.selectedMesa.mesaId, {
          estado: 'ocupada',
          currentClientId: this.selectedClient.id,
          assignedAt: new Date() // Registrar el momento de la asignación
        });

        // 2. Actualizar el estado del cliente en espera a 'asignado'
        await this.firebaseService.actualizarClienteEnEspera(this.selectedClient.id, {
          estado: 'asignado'
        });

        Swal.fire({
          icon: 'success',
          title: '¡Mesa Asignada!',
          text: `${this.selectedClient.nombre} ha sido asignado a la mesa ${this.selectedMesa.numeroMesa}.`,
          confirmButtonText: 'OK',
          heightAuto: false
        });

        // Resetear selecciones
        this.selectedClient = null;
        this.selectedMesa = null;

      } catch (error) {
        console.error('Error al asignar mesa:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error de Asignación',
          text: 'Hubo un problema al asignar la mesa. Inténtelo de nuevo.',
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
      }
    }
  }

  // Asegurarse de desuscribirse para evitar fugas de memoria
  ngOnDestroy() {
    if (this.mesaSubscription) {
      this.mesaSubscription.unsubscribe();
    }
    if (this.clienteSubscription) {
      this.clienteSubscription.unsubscribe();
    }
  }

}
