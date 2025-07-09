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
  verChats = false;
  message: string = "";
  messages: any[] = [];
  showLogOut: boolean = false;
  user: any; // Tipo User de Firebase Auth
  userName: string = "";
  showVerifyMessage: boolean = false;
  verifyMessage: string = "";
  isLoading = true;
  isClient: boolean = false;
  isMozo: boolean = false;
  mesaIdActual: string | null = null;
  numeroMesa:any;
  sesionChatIdActual: string | null = null;

  mozoActiveSessions: { mesaId: string, sesionId: string, numeroMesa: string ,clienteNombre?: string }[] = [];
  selectedMozoChat: { mesaId: string, sesionId: string, numeroMesa: string ,clienteNombre?: string } | null = null;

  private chatSubscription: (() => void) | undefined; 
  private userRoleSubscription: Subscription | undefined; 

  constructor(private router: Router, private firebase: FirebaseService) { }

  async ngOnInit() {
    this.user = await this.firebase.obtenerUsuarioLogueado();
   

    if (this.user) {

      if (this.user && this.user.perfil) {
        this.userName = this.user.nombreUsuario || this.user.email?.split('@')[0] || 'Usuario';
        this.isClient = this.user.perfil === 'cliente';
        this.isMozo = this.user.tipo==='mozo'; 

        if (this.isClient) {
          await this.loadClientChatSession();
        } else if (this.isMozo) {
          await this.loadMozoChatSessions();
          
          this.numeroMesa = await this.firebase.obtenerNumeroMesaPorDocId(this.mesaIdActual as string);
          console.log(this.numeroMesa)

          } else {

          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'Tu perfil no tiene acceso a esta función.',
            confirmButtonText: 'Aceptar',
            heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
          });
          this.router.navigateByUrl('/home'); 
          return;
        }
      } else {

        Swal.fire({
          icon: 'error',
          title: 'Error de Perfil',
          text: 'No se pudo cargar tu perfil. Por favor, intenta de nuevo.',
          confirmButtonText: 'Aceptar',
          heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
        });
        this.router.navigateByUrl('/login');
        return;
      }
    } else {
      this.router.navigateByUrl('login'); 
    } 
   
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  ngOnDestroy() {

    if (this.chatSubscription) {
      this.chatSubscription(); 
    }
    if (this.userRoleSubscription) {
      this.userRoleSubscription.unsubscribe();
    }
  }


  verContenedorChats()
  {
    this.verChats = !this.verChats;
  }


  async loadClientChatSession() {
    
    const mesaAsignada = await this.firebase.obtenerMesaPorUidUsuario(this.user!.uid);

    console.log('Mesa asignada:', mesaAsignada);
    console.log('UID del usuario:', this.user.uid);
    console.log('Buscando sesión activa...');

    if (mesaAsignada && mesaAsignada.mesaId) {
      this.mesaIdActual = mesaAsignada.mesaId;
      this.numeroMesa = mesaAsignada.numeroMesa;
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

      this.verifyMessage = "No tienes una mesa asignada para chatear.";
      this.showVerifyMessage = true;
    }
  }

  async loadMozoChatSessions() {
    this.mozoActiveSessions = await this.firebase.getActiveTableSessionsForMozo();

    if (this.mozoActiveSessions.length > 0 && !this.selectedMozoChat) {
      this.selectMozoChat(this.mozoActiveSessions[0]);
    }
  }

  async selectMozoChat(session: { mesaId: string, sesionId: string, numeroMesa: string,clienteNombre?: string }) {
    
 
    this.isLoading = true;
    this.selectedMozoChat = session;
    this.mesaIdActual = session.mesaId;
    this.sesionChatIdActual = session.sesionId;
    this.numeroMesa = session.numeroMesa;
    
    if (this.chatSubscription) {
      this.chatSubscription(); 
    }
    
    this.chatSubscription = this.firebase.getAllMessagesFromTableSession(
      this.mesaIdActual,
      this.sesionChatIdActual,
      (messages) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    );

    this.verChats = false;
    
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
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
      
      let message;
    
      message = {
        message: this.message,
        userEmail: this.user.correoUsuario,
        userName: this.user.nombreUsuario,
        userTipo: this.user.perfil,
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
