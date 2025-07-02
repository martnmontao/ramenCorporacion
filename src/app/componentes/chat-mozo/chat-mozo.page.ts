import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getAuth, User as FirebaseAuthUser, signOut } from 'firebase/auth';
import { Subscription, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat-mozo',
  templateUrl: './chat-mozo.page.html',
  styleUrls: ['./chat-mozo.page.scss'],
  standalone: false
})
export class ChatMozoPage implements OnInit {
@ViewChild('chatContainer') chatContainer!: ElementRef;

  message: string = "";
  messages: any[] = [];
  showLogOut: boolean = false;
  user: any; // Tipo User de Firebase Auth
  userName: string = "";
  showVerifyMessage: boolean = false;
  verifyMessage: string = "";

  isClient: boolean = false;
  isMozo: boolean = false;
  mesaIdActual: string | null = null;
  sesionChatIdActual: string | null = null;

  mozoActiveSessions: { mesaId: string, sesionId: string, clienteNombre?: string }[] = [];
  selectedMozoChat: { mesaId: string, sesionId: string, clienteNombre?: string } | null = null;

  private chatSubscription: (() => void) | undefined; // <<-- CAMBIO: onSnapshot devuelve una función de desuscripción -->>
  private userRoleSubscription: Subscription | undefined; // Si manejas roles con RxJS (mantener si lo usas)

  constructor(private router: Router, private firebase: FirebaseService) { }

  async ngOnInit() {
    const auth = getAuth();
    this.user = await this.firebase.obtenerUsuarioLogueado();

    if (this.user) {
      // --- LÓGICA MEJORADA PARA DETERMINAR EL ROL --- 
      if (this.user && this.user.perfil) {
        this.userName = this.user.nombreUsuario || this.user.email?.split('@')[0] || 'Usuario';
        this.isClient = this.user.perfil === 'cliente';
        this.isMozo = this.user.tipo==='mozo'; // O el nombre de perfil que uses para mozos

        if (this.isClient) {
          await this.loadClientChatSession();
        } else if (this.isMozo) {
          await this.loadMozoChatSessions();
        } else {
          // Si el perfil no es ni cliente ni mozo, redirige
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'Tu perfil no tiene acceso a esta función.',
            confirmButtonText: 'Aceptar',
            heightAuto: false
          });
          this.router.navigateByUrl('/home'); // O a una página de error/inicio de sesión apropiada
          return;
        }
      } else {
        // No se pudo cargar el perfil del usuario
        Swal.fire({
          icon: 'error',
          title: 'Error de Perfil',
          text: 'No se pudo cargar tu perfil. Por favor, intenta de nuevo.',
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
        this.router.navigateByUrl('/login');
        return;
      }
    } else {
      this.router.navigateByUrl('login'); // Redirigir si no hay usuario logueado
    }
  }

  ngOnDestroy() {
    // Desuscribirse para evitar fugas de memoria
    if (this.chatSubscription) {
      this.chatSubscription(); // <<-- LLAMAR COMO FUNCIÓN PARA onSnapshot -->>
    }
    if (this.userRoleSubscription) {
      this.userRoleSubscription.unsubscribe();
    }
  }

  async loadClientChatSession() {
    // 1. Obtener la mesa asignada al cliente
    const mesaAsignada = await this.firebase.obtenerMesaPorUidUsuario(this.user!.uid);

    console.log('Mesa asignada:', mesaAsignada);
console.log('UID del usuario:', this.user.uid);
console.log('Buscando sesión activa...');

    if (mesaAsignada && mesaAsignada.mesaId) {
      this.mesaIdActual = mesaAsignada.mesaId;

      // 2. Usar la nueva función para obtener el ID de la sesión de chat activa para esta mesa y cliente
      const activeSesionId = await this.firebase.getClientActiveChatSessionId(this.mesaIdActual, this.user!.uid);

      if (activeSesionId) {
          console.log('Sesión activa encontrada:', activeSesionId);
        this.sesionChatIdActual = activeSesionId;

        this.chatSubscription = this.firebase.getAllMessagesFromTableSession(
          this.mesaIdActual,
          this.sesionChatIdActual,
          (messages) => {
            this.messages = messages;
            setTimeout(() => this.scrollToBottom(), 100);
          }
        );
      } else {
        console.log('No hay sesión activa. Iniciando nueva...');
        const nuevaSesionId = await this.firebase.iniciarNuevaSesionChatMesa(
      this.mesaIdActual,
      this.user.uid,
      this.user.nombreUsuario
    );
    console.log('Nueva sesión creada:', nuevaSesionId);
    this.sesionChatIdActual = nuevaSesionId;

    // Suscribirse a mensajes
    this.chatSubscription = this.firebase.getAllMessagesFromTableSession(
      this.mesaIdActual,
      nuevaSesionId,
      (messages) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    );
      }
    } else {
      // Cliente no tiene mesa asignada.
      this.verifyMessage = "No tienes una mesa asignada para chatear.";
      this.showVerifyMessage = true;
    }
  }

  async loadMozoChatSessions() {
    this.mozoActiveSessions = await this.firebase.getActiveTableSessionsForMozo();
    // Opcional: Si solo hay una sesión activa, seleccionarla por defecto
    if (this.mozoActiveSessions.length > 0 && !this.selectedMozoChat) {
      this.selectMozoChat(this.mozoActiveSessions[0]);
    }
  }

  selectMozoChat(session: { mesaId: string, sesionId: string, clienteNombre?: string }) {
    this.selectedMozoChat = session;
    this.mesaIdActual = session.mesaId;
    this.sesionChatIdActual = session.sesionId;

    // Desuscribirse del chat anterior si lo hay
    if (this.chatSubscription) {
      this.chatSubscription(); // <<-- LLAMAR COMO FUNCIÓN -->>
    }

    this.chatSubscription = this.firebase.getAllMessagesFromTableSession(
      this.mesaIdActual,
      this.sesionChatIdActual,
      (messages) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    );
  }

  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  goTo() {
    if (this.isClient) {
      this.router.navigateByUrl('home-cliente');
    } else if (this.isMozo) {
      this.router.navigateByUrl('home');
    } else {
      this.router.navigateByUrl('home');
    }
  }

  showLogOutContainer() {
    this.showLogOut = !this.showLogOut;
  }

  async sendMessage() {
    if (!this.user || !this.mesaIdActual || !this.sesionChatIdActual) {
      this.verifyMessage = "No se puede enviar el mensaje. Sesión de chat no activa o usuario no logueado.";
      this.showVerifyMessage = true;
      return;
    }

    if (this.message.trim() === "") {
      this.verifyMessage = "No puedes enviar un mensaje vacío.";
      this.showVerifyMessage = true;
    } else {
      let message = {
        message: this.message,
        userEmail: this.user.correoUsuario,
        userName: this.user.nombreUsuario,
        date: new Date()
      };
      await this.firebase.appendChatMessageToTableSession(this.mesaIdActual, this.sesionChatIdActual, message);
      this.message = "";
    }
  }

  logOut() {
    const auth = getAuth();
    signOut(auth).then(() => {
      this.router.navigateByUrl('login');
      console.log('Usuario deslogueado');
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }

  showVerifyMessageContainer() {
    this.showVerifyMessage = !this.showVerifyMessage;
  }
}
