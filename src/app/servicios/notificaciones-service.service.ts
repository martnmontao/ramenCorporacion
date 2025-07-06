import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  PushNotifications,
  PushNotificationSchema,
  Token,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class NotificacionesServiceService {
  private token: string | null = null;
  private backendURL = 'http://localhost:4000';
  constructor(private platform: Platform, private http: HttpClient) {
    if (this.platform.is('capacitor')) this.initPush();
  }

  initPush() {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      this.token = token.value;
      alert('Token guardado: ' + this.token);
    });

    PushNotifications.addListener('registrationError', error => {
      console.error('Error al registrar push:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Notificación en primer plano:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Notificación interactuada:', notification);
    });
  }

  getToken(): string | null {
    return this.token;
  }

  
  enviarCorreo(nombreUsuario: string, mail: string, aceptacion: boolean): Observable<{ seEnvio: boolean }> {
    return this.http.post<{ seEnvio: boolean }>(`${this.backendURL}/send-mail`, {
      nombreUsuario,
      mail,
      aceptacion
    });
  }
}