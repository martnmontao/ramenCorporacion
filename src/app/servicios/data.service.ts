import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { addDoc, arrayUnion, collection, doc, Firestore, getDocs, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Foto } from '../componentes/models/foto.model';
import { Duenio } from '../componentes/alta-duenio/alta-duenio.page';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public userId: string | null = null;
  public nombreUsuario: string | null = null;

  public fotos: any[] = [];

  constructor(private firestore: Firestore, private auth: Auth) {
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

  async subirFoto(base64Imagen: string): Promise<void> {
    if (!this.userId || !this.nombreUsuario) {
      throw new Error('Usuario no autenticado');
    }

    try {
      await addDoc(collection(this.firestore, 'registro'), {
        fecha: new Date(),
        userId: this.userId,
        imagenBase64: base64Imagen,
        usuarioEmail: this.nombreUsuario,
      });
    } catch (error) {
      console.error('Error al subir la foto:', error);
      throw error;
    }
  }

  guardarDuenio(duenio: Duenio) {
  const colRef = collection(this.firestore, 'usuarios');
  return addDoc(colRef, duenio);
}


}
