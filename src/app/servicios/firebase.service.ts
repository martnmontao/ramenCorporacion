import { Injectable } from '@angular/core';

import { Auth, authState, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signOut, User, UserCredential } from '@angular/fire/auth';
import { Firestore, collection, addDoc, query, orderBy, limit, getDocs, where, CollectionReference, collectionData, updateDoc, doc } from '@angular/fire/firestore';
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
  private userObj: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
  public currentUserProfile$: Observable<any | null> = this.userObj.asObservable();
  private registroCollection: CollectionReference;
  private usuariosCollection: CollectionReference;

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
  
    this.registroCollection = collection(this.firestore, 'registro');
    this.usuariosCollection = collection(this.firestore, 'usuarios');
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

  getCurrentUserProfile(): Observable<any | null> {
    return this.currentUserProfile$;
  }

  async obtenerUsuarioLogueado() {
    const usersRef = collection(this.firestore, 'usuarios');
    console.log(this.userId);
    const q = query(usersRef, where('uid', '==', this.userId), limit(1)); 
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      console.log("no encontrado") // si no encuentra usuario
      return null;
      
    }
  }

  agregarDocumento(data: any, col: string) {
    const dataRef = collection(this.firestore, col);
    return addDoc(dataRef, data);
  }

  async getUsuariosNoAutorizados(): Promise<any[]> {
    try {
      const q = query(this.registroCollection, 
      where('autorizado', '==', false));
      const querySnapshot = await getDocs(q);
      const usuariosNoAutorizados: any[] = [];
      querySnapshot.forEach((doc) => {
        // Incluye el ID del documento para poder referenciarlo al autorizar/eliminar
        usuariosNoAutorizados.push({ id: doc.id, ...doc.data() });
      });
      console.log(usuariosNoAutorizados)
      return usuariosNoAutorizados;
    } catch (error) {
      console.error('Error al obtener usuarios no autorizados:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios no autorizados.',
        confirmButtonText: 'Aceptar',
        heightAuto: false
      });
      throw error;
    }
  }

  async getClientesNoAutorizados(): Promise<any[]> {
    try {
      const q = query(this.registroCollection, 
        where('autorizado', '==', false),
        where('perfil', '==', 'cliente')
      );
      const querySnapshot = await getDocs(q);
      const clientesNoAutorizados: any[] = [];
      querySnapshot.forEach((doc) => {
        
        clientesNoAutorizados.push({ id: doc.id, ...doc.data() });
      });
      return clientesNoAutorizados;
    } catch (error) {
      console.error('Error al obtener usuarios no autorizados:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios no autorizados.',
        confirmButtonText: 'Aceptar',
        heightAuto: false
      });
      throw error;
    }
  }

    async getClientesAutorizados(): Promise<any[]> {
    try {
      const q = query(this.usuariosCollection, 
        where('perfil', '==', 'cliente')
      );
      const querySnapshot = await getDocs(q);
      const clientesNoAutorizados: any[] = [];
      querySnapshot.forEach((doc) => {
        
        clientesNoAutorizados.push({ id: doc.id, ...doc.data() });
      });
      return clientesNoAutorizados;
    } catch (error) {
      console.error('Error al obtener usuarios no autorizados:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios no autorizados.',
        confirmButtonText: 'Aceptar',
        heightAuto: false
      });
      throw error;
    }
  }

  async autorizarUsuario(userData: any, docId: string): Promise<boolean> {
    const docRefRegistro = doc(this.firestore, 'registro', docId);
      try {
        // 1. Actualizar el documento en la colección 'registro' para marcarlo como autorizado
        await updateDoc(docRefRegistro, { autorizado: true });

        // 2. Llamar a registroUsuario para crear la cuenta en Firebase Auth
        // y añadir los datos completos del usuario a la colección 'usuarios'.
        // La clave de usuario no se almacenará en Firestore, solo se usa para Auth.
        await this.registroUsuario(userData.correoUsuario, userData.claveUsuario, userData);

        console.log(`Usuario ${userData.correoUsuario} autorizado y procesado con éxito.`);
        Swal.fire({
          icon: 'success',
          title: '¡Autorizado!',
          text: `El usuario ${userData.correoUsuario} ha sido autorizado y su cuenta ha sido creada.`,
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
        return true;
      } catch (error: any) {
        console.error('Error al autorizar usuario:', error);
        let errorMessage = 'Error al autorizar usuario. Por favor, inténtelo de nuevo.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'El correo electrónico ya está registrado en Firebase Authentication.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'El formato del correo electrónico es inválido.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La clave debe tener al menos 6 caracteres.';
        }
        // Revertir el estado 'autorizado' en 'registro' si falla el registro en Auth o la adición a 'usuarios'
        await updateDoc(docRefRegistro, { autorizado: false }); // Esto revierte el cambio
        Swal.fire({
          icon: 'error',
          title: 'Error de autorización',
          text: errorMessage,
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
        throw error;
      }
  }

  async registroUsuario(email: string, clave: string, userDataForFirestore: any): Promise<User> {
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, clave);
      const firebaseAuthUid = userCredential.user.uid;

      // Añadir los datos del usuario a la colección 'usuarios'
      // Es importante NO almacenar la clave de usuario en la base de datos de Firestore por seguridad.
      const { claveUsuario, ...dataWithoutPassword } = userDataForFirestore; // Asegura que la clave no se guarde en Firestore

      await addDoc(this.usuariosCollection, {
        ...dataWithoutPassword,
        uid: firebaseAuthUid, // Guarda el UID de Firebase Auth para vincular
        autorizado: true // Marca el usuario como autorizado en la nueva colección (redundante si ya lo está, pero asegura consistencia)
      });

      console.log('Usuario registrado y datos guardados en "usuarios" con UID:', firebaseAuthUid);
      // El mensaje de éxito general para la autorización se maneja en autorizarUsuario()
      return userCredential.user;
    } catch (error: any) {
      console.error('Error al registrar usuario en Firebase Auth y Firestore:', error);
      let errorMessage = 'Error al registrar el usuario. Por favor, asegúrese de que el correo no esté ya en uso.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso. Por favor, use otro.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico es inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La clave debe tener al menos 6 caracteres.';
      }
      // Se propaga el error para que autorizarUsuario lo capture y muestre la alerta.
      throw error;
    }
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



