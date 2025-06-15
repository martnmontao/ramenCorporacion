import { Injectable } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, User, UserCredential } from '@angular/fire/auth';
import { Firestore, collection, addDoc, query, orderBy, limit, getDocs, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public user$: Observable<User | null>

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    this.user$ = authState(this.auth);
  }


  async acceder(correo: string, clave: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, correo, clave);
      if (userCredential.user) {
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      let mensaje = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found') {
        mensaje = 'El correo electrónico no está registrado.';
      } else if (error.code === 'auth/wrong-password') {
        mensaje = 'La contraseña es incorrecta.';
      }
      Swal.fire({
            icon: 'error', 
            title: 'Error de inicio de sesión',
            text: error.mensaje,
            confirmButtonText: 'Aceptar',
            heightAuto: false 
          });
      throw error; // Re-lanza el error para que el componente pueda manejarlo si es necesario
    }
  }

  cerrarSesion() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    })
  }

  getUser(): Observable<User | null> {
    return this.user$;
  }

}
