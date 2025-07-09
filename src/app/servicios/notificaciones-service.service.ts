import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  PushNotifications,
  PushNotificationSchema,
  Token,
  ActionPerformed,
} from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class NotificacionesServiceService {
  private token: string | null = null;

  constructor(private platform: Platform) {
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
      //alert('Token guardado: ' + this.token);
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

  

}