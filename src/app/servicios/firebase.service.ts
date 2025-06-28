import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signOut, User, UserCredential } from '@angular/fire/auth';
import { Firestore, collection, addDoc, query, orderBy, limit, getDocs, where, collectionData, updateDoc, doc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public userId: string | null=null;
  public nombreUsuario: string | null = null;
  public fotos: any[] = [];
  public apellidoUsuario: string | null = null;
  public dni: number | null = null;
  public cuit: number | null = null;
  public perfil: string | null = null;
  public email: string | null = null;
  private userObj: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null); 

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
          if (user) {
            this.userId = user.uid;
            this.nombreUsuario = user.email;
          } else {
            this.userId = null;
            this.nombreUsuario = null;
          }
          console.log("AuthState:", this.userId);
        });
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
      throw error;
    }
  }

  async cerrarSesion() {
    try {
      await signOut(this.auth).then(() => {
      this.userObj.next(null);
      this.router.navigate(['/login']);
    })
      this.userObj.next(null);
    } catch (e) {
      console.error('Error during logout:', e);
    }
  }

  getUser() {
    return this.userObj.value;
  }

  agregarDocumento(data: any, col: string) {
    const dataRef = collection(this.firestore, col);
    return addDoc(dataRef, data);
  }

  getCollection<T>(nombreColeccion: string,campo?: string,valor?: any): Observable<T[]> 
  {
    const ref = collection(this.firestore, nombreColeccion);
    const refFinal = campo && valor !== undefined? query(ref, where(campo, '==', valor)) : ref;

    return collectionData(refFinal, { idField: 'id' }) as Observable<T[]>;
  }
  
  updateDocumento(nombreColeccion: string, id: string, data: any): Promise<void> 
  {
    const ref = doc(this.firestore, `${nombreColeccion}/${id}`);
    return updateDoc(ref, data);
  }

}
