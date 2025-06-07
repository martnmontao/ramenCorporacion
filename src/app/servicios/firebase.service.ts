import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { Firestore, collection, addDoc, query, orderBy, limit, getDocs, where } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private auth: Auth, private firestore: Firestore) { }


  acceder(email: string, clave: string): Promise<UserCredential> 
  {
    return signInWithEmailAndPassword(this.auth, email, clave);
  }

  cerrarSesion(): Promise<void> 
  {
    return this.auth.signOut();
  }

}
