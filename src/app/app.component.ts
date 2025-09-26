import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
   constructor(private platform: Platform, private router: Router) {
  this.initializeApp();
  }

  initializeApp() {
      this.platform.ready().then(respuesta => 
      {
        setTimeout(() => {
          SplashScreen.hide();
        }, 1000);
        setTimeout(() => 
        {
          this.router.navigateByUrl('splash-screen');

        },800)
      })
    
      
      
    
    
   
  }
}

