import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  mostrarOpciones = false;
  
  isLoading: boolean = true; // Para mostrar un indicador de carga
  currentUserProfile: any | null = null; // Almacena el perfil del usuario logueado
  private profileSubscription: Subscription | undefined; // Para desuscribirse del Observable del perfil
  uid: string = '';
  user: any;
  hayUsuarios: boolean = true;
  // Variables para controlar la visibilidad del contenido y los permisos
  isGerencia: boolean = false;
  isMaitre: boolean = false; // true si es empleado tipo 'maitre'
  // Variable para controlar el filtro de usuarios
  filtroSeleccionado: string = 'cliente'; 
  filtroSeleccionadoCliente: boolean = true;

  usuariosParaAutorizar: any = [];
  usuariosParaNoAutorizar: any = [];

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  async ngOnInit() {
 
    this.isLoading = true;

  try {
    this.user = await this.firebaseService.obtenerUsuarioLogueado();

    if (this.user.perfil === 'gerencia' || this.user.tipo === 'maitre') {
      
      
       await this.cargarUsuariosPorPerfil('cliente');


    } else {
      this.hayUsuarios = false;
    }
  } catch (error) {
    console.error('Error al obtener el usuario logueado:', error);
    this.hayUsuarios = false;
  } finally {
    this.isLoading = false;
  }


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

    if (result.isConfirmed) 
    {
      try {
        this.isLoading = true;
        const autorizadoExitoso = await this.firebaseService.autorizarUsuario(usuario, usuario.id);
        if(this.filtroSeleccionado == 'cliente')
          {
          await this.cargarUsuariosPorPerfil('cliente');

        }
        else
        {
          await this.cargarUsuariosPorPerfil('empleado');

        }


      } catch (error) {
        // Los errores ya se manejan con SweetAlert en el servicio, aquí solo logueamos.
        console.error('Error en el componente al intentar autorizar:', error);
      }
    }
  }

   async offAutorizarUsuario(usuario: any) {
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
      title: '¿Confirmar rechazo?',
      text: `¿Estás seguro de que quieres rechazar a ${usuario.nombreUsuario || 'este usuario'}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'No, cancelar',
      heightAuto: false
    });

    if (result.isConfirmed) 
    {
      try {
        this.isLoading = true;
        const autorizadoExitoso = await this.firebaseService.eliminarUsuarioRegistro(usuario.correoUsuario);
        if(this.filtroSeleccionado == 'cliente')
          {
          await this.cargarUsuariosPorPerfil('cliente');

        }
        else
        {
          await this.cargarUsuariosPorPerfil('empleado');

        }


      } catch (error) {
        // Los errores ya se manejan con SweetAlert en el servicio, aquí solo logueamos.
        console.error('Error en el componente al intentar autorizar:', error);
      }
    }
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

  

  irA(path:string)
  {
    this.router.navigateByUrl(path);
  }

  cerrarSesion()
  {
    this.firebaseService.cerrarSesion();
  }

  async cargarUsuariosPorPerfil(perfil: 'cliente' | 'empleado') {
  this.isLoading = true;
    this.filtroSeleccionado = perfil;
  try {
    // Usuarios autorizados (colección 'usuarios')
    this.usuariosParaNoAutorizar = await this.firebaseService.getCollectionMultipleFilters('usuarios', [
      { campo: 'perfil', condicion: '==', valor: perfil }
    ]);
    
    // Usuarios no autorizados (colección 'registro')
    this.usuariosParaAutorizar = await this.firebaseService.getCollectionMultipleFilters('registro', [
      { campo: 'perfil', condicion: '==', valor: perfil },
      { campo: 'autorizado', condicion: '==', valor: false }
    ]);
    

    // Ajustamos la variable para mostrar mensaje si no hay usuarios
    this.hayUsuarios = this.usuariosParaAutorizar.length > 0 || this.usuariosParaNoAutorizar.length > 0;

  } catch (error) {
    console.error('Error cargando usuarios:', error);
    this.usuariosParaAutorizar = [];
    this.usuariosParaNoAutorizar = [];
    this.hayUsuarios = false;
  }finally
  {
    this.isLoading = false;
  }
}
}