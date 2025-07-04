import { Injectable } from '@angular/core';

import { PushNotifications } from '@capacitor/push-notifications';

import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
   public pushToken: string | null = null;

  setToken(token: string) {
    this.pushToken = token;
  }

  getToken(): string | null {
    return this.pushToken;
  }
}
 

