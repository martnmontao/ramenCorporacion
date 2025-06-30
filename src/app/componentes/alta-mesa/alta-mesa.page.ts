import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Mesa } from 'src/app/interfaces/mesa';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.page.html',
  styleUrls: ['./alta-mesa.page.scss'],
  standalone: false
})
export class AltaMesaPage implements OnInit {

  mesaForm: FormGroup;

  tiposMesa: string[] = ['estandar', 'VIP', 'apta-movilidad-reducida'];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService // Inyectamos tu servicio de Firebase
  ) {
    // Inicialización del formulario en el constructor
    this.mesaForm = this.fb.group({
      numeroMesa: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]], // Números o letras para el identificador de mesa
      capacidad: ['', [Validators.required, Validators.min(1), Validators.max(7)]], // Capacidad entre 1 y 20 personas
      tipo: ['estandar', Validators.required], // Valor por defecto 'estandar'
      //qrCodeUrl: ['', [Validators.required, Validators.pattern('(https?://.*.(?:png|jpg|jpeg|gif|svg))')]], // URL de ejemplo para el QR
    });
  }

  ngOnInit() {
  }

  // Método para manejar el envío del formulario
  async onSubmit() {
    if (this.mesaForm.valid) {
      const datosFormulario = this.mesaForm.value;

      // Construimos el objeto Mesa con los datos del formulario
      // mesaId se generará por Firestore, y estado, currentClientId, assignedAt se inicializan
      const nuevaMesa: Omit<Mesa, 'mesaId'> = {
        numeroMesa: datosFormulario.numeroMesa,
        capacidad: datosFormulario.capacidad,
        tipo: datosFormulario.tipo,
        estado: 'disponible', // Por defecto, una mesa recién creada está disponible
        qrCodeUrl: datosFormulario.qrCodeUrl || null,
        currentClientId: null, // No hay cliente asignado al crearla
        assignedAt: null // No está asignada al crearla
      };

      try {
        await this.firebaseService.agregarMesa(nuevaMesa);
        // La notificación de éxito ya está dentro de agregarMesa en el servicio
        this.mesaForm.reset({
          numeroMesa: '',
          capacidad: '',
          tipo: 'estandar', // Vuelve al valor por defecto
          qrCodeUrl: ''
        });
        // Opcional: Navegar a otra página si la lógica lo requiere, por ejemplo, a una lista de mesas
        // this.router.navigate(['/listado-mesas']);
      } catch (error) {
        // La notificación de error ya está dentro de agregarMesa en el servicio
        console.error('Error al dar de alta la mesa en el componente:', error);
      }
    } else {
      // Mostrar un mensaje de error si el formulario no es válido
      Swal.fire({
        icon: 'warning',
        title: 'Formulario Inválido',
        text: 'Por favor, complete todos los campos requeridos correctamente.',
        confirmButtonText: 'Aceptar',
        heightAuto: false
      });
      // Marcar los campos para que se muestren los mensajes de error de validación
      this.mesaForm.markAllAsTouched();
    }
  }

  // Getter para un acceso fácil a los controles del formulario en la plantilla
  get formControls() {
    return this.mesaForm.controls;
  }

}
