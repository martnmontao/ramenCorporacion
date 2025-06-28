import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { Firestore, collection, collectionData,addDoc, query, doc,orderBy, limit, getDocs, where, updateDoc } from '@angular/fire/firestore';

import { Observable } from 'rxjs';

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

   agregarDocumento(data: any, col: string) 
  {
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
