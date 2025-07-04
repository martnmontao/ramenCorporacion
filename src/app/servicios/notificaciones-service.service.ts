import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesServiceService {

  private token: string | null = null;

  constructor(private platform: Platform) {if(this.platform.is('capacitor')) this.initPush()}

  initPush() {
    console.log('Initializing HomePage');

    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });


    PushNotifications.addListener('registration',
      (token: Token) => {
        this.token = token.value;
        alert('Token guardado' + this.token);
      }
    );

    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.error('Error al registrar push: ', error);
      }
    );

    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Notificación recibida en primer plano:', notification);
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Notificación interactuada:', notification);
      }
    );
  }

  getToken(): string | null{
    return this.token;
  }

  




}
