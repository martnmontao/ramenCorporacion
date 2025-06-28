import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.page.html',
  styleUrls: ['./lista-usuarios.page.scss'],
  standalone: false
})
export class ListaUsuariosPage implements OnInit {

  usuariosParaAutorizar: any[] = []; 
  cargandoUsuarios: boolean = true; // Para mostrar un indicador de carga
  currentUserProfile: any | null = null; // Almacena el perfil del usuario logueado
  private profileSubscription: Subscription | undefined; // Para desuscribirse del Observable del perfil
  uid: string = '';
  user: any;
  
  // Variables para controlar la visibilidad del contenido y los permisos
  isGerencia: boolean = false;
  isMaitre: boolean = false; // true si es empleado tipo 'maitre'

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    this.user = await this.firebaseService.obtenerUsuarioLogueado();

    if(this.user.perfil == 'gerencia'){
      this.usuariosParaAutorizar = await this.firebaseService.getUsuariosNoAutorizados();
    }
    if(this.user.tipo == 'maitre'){

      this.usuariosParaAutorizar = await this.firebaseService.getClientesAutorizados();
      
    }
    console.log('esta es la lista de usuarios',this.usuariosParaAutorizar)

    console.log(this.user)

  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe(); 
    }
  }

  async onAutorizarUsuario(usuario: any) {
    // usuario debe contener al menos: { id: string (docId), correoUsuario: string, claveUsuario: string, ...otrosDatos }
    if (!usuario || !usuario.id) {
      console.error('Datos de usuario incompletos para la autorización:', usuario);
      Swal.fire({
        icon: 'error',
        title: 'Error de datos',
        text: 'No se pudo obtener la información completa del usuario para autorizar.',
        confirmButtonText: 'Aceptar',
        heightAuto: false
      });
      return;
    }

    // Confirmación opcional antes de autorizar
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Confirmar autorización?',
      text: `¿Estás seguro de que quieres autorizar a ${usuario.nombreUsuario || 'este usuario'}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, autorizar',
      cancelButtonText: 'No, cancelar',
      heightAuto: false
    });

    if (result.isConfirmed) {
      try {
        // Llama a la función del servicio para autorizar al usuario
        const autorizadoExitoso = await this.firebaseService.autorizarUsuario(usuario, usuario.id);

        if (autorizadoExitoso) {
          // Si la autorización fue exitosa, actualiza la lista de usuarios pendientes.
          // Esto elimina al usuario recién autorizado de la vista.
          this.usuariosParaAutorizar = this.usuariosParaAutorizar.filter(
            (u: any) => u.id !== usuario.id
          );
        }
      } catch (error) {
        // Los errores ya se manejan con SweetAlert en el servicio, aquí solo logueamos.
        console.error('Error en el componente al intentar autorizar:', error);
      }
    }
  }



}
