import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signOut, user, User, UserCredential } from '@angular/fire/auth';

import { Firestore, collection, addDoc, query, orderBy, limit, getDocs, where, CollectionReference, collectionData, updateDoc, doc, Timestamp, deleteDoc, onSnapshot, getDoc, arrayUnion, setDoc } from '@angular/fire/firestore';

import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';
import { Mesa } from '../interfaces/mesa';
import { ClienteEnEspera } from '../interfaces/clienteEnEspera';
import { Pedido } from '../interfaces/pedido';
import { firstValueFrom } from 'rxjs';


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
  private mesasCollection: CollectionReference;
  private listaEsperaCollection: CollectionReference;

  constructor(private auth: Auth, public firestore: Firestore, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
          if (user) {
            this.userId = user.uid;
            this.nombreUsuario = user.email;
          } else {
            this.userId = null;
            this.nombreUsuario = null;
          }

        });
  
    this.registroCollection = collection(this.firestore, 'registro');
    this.usuariosCollection = collection(this.firestore, 'usuarios');
    this.mesasCollection = collection(this.firestore, 'mesas');
    this.listaEsperaCollection = collection(this.firestore, 'lista-espera');
  }

  async acceder(correo: string, clave: string): Promise<void> {
    await this.auth.signOut();
    if(!correo || !clave){
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, complete el correo y la clave.',
          confirmButtonText: 'Aceptar',
          heightAuto: false,
          customClass: {
            popup: 'mi-alerta',
            confirmButton: 'btn-alerta',
            title: 'titulo-alerta',
            htmlContainer: 'texto-alerta'
          }
        });
        return;
    }
    try {
      
      const userCredential = await signInWithEmailAndPassword(this.auth, correo, clave);
      if (userCredential.user) {
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      let mensaje = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        const refRegistro = this.registroCollection;
        const q = query(refRegistro, where('correoUsuario', '==', correo));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const datos = snap.docs[0].data();
          if (datos['autorizado'] === false) {
            mensaje = 'Su cuenta aún no fue autorizada. Espere a ser notificado vía correo electrónico';
          } else {
            mensaje = 'Tu cuenta fue rechazada o eliminada.';
          }
        } else {
          mensaje = 'El correo electrónico no está registrado.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonText: 'Aceptar',
          heightAuto: false,
          customClass: {
            popup: 'mi-alerta',
            confirmButton: 'btn-alerta',
            title: 'titulo-alerta',
            htmlContainer: 'texto-alerta'
          }
        });
        return;
      }
      
      if (error.code === 'auth/wrong-password') {
        mensaje = 'La contraseña es incorrecta.';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'El correo ingresado es inválido.';
      } else if (error.code === 'auth/missing-password') {
        mensaje = 'Ingrese una contraseña.';
      } else {
        mensaje = '¡Ups, ocurrió un error inesperado!';
      }

      console.log(error.code);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
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

    getUsuarioActual(): User | null
  {
    return this.auth.currentUser;
  }
  
  async aplicarDescuentoAlPedido(pedido:any): Promise<void> {

    if (pedido) {
      const pedidoRef = doc(this.firestore, 'pedidos', pedido.id);
     
     

      const importeConDescuento = Math.round(pedido.importeTotal - (pedido.importeTotal * (pedido.descuento / 100)));
      console.log(importeConDescuento);
      await updateDoc(pedidoRef, {
        importeTotal: importeConDescuento // redondeo a 2 decimales
      });
    }
  }


  async verificarDescuentoJugado(pedido:any): Promise<boolean> {
    const pedidoRef = doc(this.firestore, 'pedidos', pedido.id);
    const pedidoSnap = await getDoc(pedidoRef);
    
    if (pedidoSnap.exists()) {
      const descuento = pedidoSnap.data()['descuento'];
      return descuento  == 0 || descuento > 1;
    }

    return false;
  }


  async guardarDescuento(pedido: any, porcentaje: number) {
    
    const pedidoRef = doc(this.firestore, 'pedidos', pedido.id); 
    await setDoc(pedidoRef, { descuento: porcentaje, importeTotal: Math.round(pedido.importeTotal - (pedido.importeTotal * (porcentaje / 100))) }, { merge: true });
  }

  async guardarEncuesta(datosEncuesta: any):Promise<void>{
    //const usuario = this.getUsuarioActual();
    const encuestasRef = collection(this.firestore,'encuestas');
    //if(!usuario) throw new Error('Usuario no encontrado');

    const datos = {
      //uid: usuario.uid,
      ...datosEncuesta,
      fecha: Timestamp.now()
    };
    
    await addDoc(encuestasRef,datos);
  }

  async obtenerPedidoPorUidUsuario(uidUsuario: string): Promise<any> {
    
    const pedidosRef = collection(this.firestore, 'pedidos');
    const q = query(pedidosRef, where('clienteUid', '==', uidUsuario));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() }; // Retorna el primer pedido encontrado
    }

    return null; // No se encontró ningún pedido
  }
  //obtenerUsuarioLogueado

  getEncuestas(): Observable<any[]>{
    const encuestasRef = collection(this.firestore,'encuestas');
    return collectionData(encuestasRef, {idField: 'id'}) as Observable<any[]>;
  }

  getCurrentUserProfile(): Observable<any | null> {
    return this.currentUserProfile$;
  }


  async obtenerUsuarioLogueado() {
    const usersRef = collection(this.firestore, 'usuarios');
    console.log("ESTE ES EL UID",this.userId);
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
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
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
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
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
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
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
          heightAuto: false,
          customClass: {
            popup: 'mi-alerta',
            confirmButton: 'btn-alerta',
            title: 'titulo-alerta',
            htmlContainer: 'texto-alerta'
          }
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

  async verificarExistentesRegistro(email: string, documento: string, cuil?: string): Promise<string | null>{
    /*verifico que no haya datos duplicados de identificación en otro registro */
    try{
      const ref = this.registroCollection;

      // Query para consultar si ya no me registré con un CORREO ELECTRÓNICO
      const qEmail = query(ref, where('correoUsuario', '==', email));
      const rEmail = await getDocs(qEmail);
      if (!rEmail.empty) return '¡Ya existe un registro con este correo!';

      // Query para consultar si ya no me registré con un DOCUMENTO
      const qDoc = query(ref,where('documentoUsuario','==', documento));
      const rDoc = await getDocs(qDoc);
      if (!rDoc.empty) return '¡Ya existe un registro con este número de documento!';

      // Query para consultar si ya no me registré con un CUIL
      if(cuil !== undefined){
        const qCuil = query(ref,where('cuil','==', cuil));
        const rCuil = await getDocs(qCuil);
        if (!rCuil.empty) return '¡Ya existe un registro con este número de CUIL!';
      }


      return null;
    }catch(error){
      console.error('Error al verificar duplicados: ', error);
      throw new Error('Error al verificar datos duplicados')
    }
  }

  async eliminarUsuarioRegistro(correoUsuario: string): Promise<void> {
   try {
    const registrosRef = collection(this.firestore, 'registro');
    const q = query(registrosRef, where('correoUsuario', '==', correoUsuario));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      Swal.fire({
        icon: 'warning',
        title: 'Usuario no encontrado',
        text: `No se encontró ningún usuario con el correo ${correoUsuario}`,
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      return;
    }

    // Eliminar solo la primera coincidencia
    const docToDelete = querySnapshot.docs[0];
    await deleteDoc(doc(this.firestore, 'registro', docToDelete.id));

    Swal.fire({
      icon: 'success',
      title: '¡Usuario Rechazado!',
      text: `El usuario ${correoUsuario} fue eliminado correctamente.`,
      confirmButtonText: 'Aceptar',
      heightAuto: false,
      customClass: {
        popup: 'mi-alerta',
        confirmButton: 'btn-alerta',
        title: 'titulo-alerta',
        htmlContainer: 'texto-alerta'
      }
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo eliminar el usuario. Inténtelo de nuevo.',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
      customClass: {
        popup: 'mi-alerta',
        confirmButton: 'btn-alerta',
        title: 'titulo-alerta',
        htmlContainer: 'texto-alerta'
      }
    });
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


  async getCollectionMultipleFilters(
    coleccion: string,
    filtros: { campo: string, condicion: any, valor: any }[]
  ): Promise<any[]> {
    const ref = collection(this.firestore, coleccion);

    const constraints = filtros.map(filtro =>
      where(filtro.campo, filtro.condicion, filtro.valor)
    );

    const q = query(ref, ...constraints);

    return await firstValueFrom(collectionData(q, { idField: 'id' }));
  }

  /**
   * Agrega una nueva mesa a la colección 'mesas'.
   * @param datosMesa Los datos de la mesa a agregar.
   * @returns Una promesa que resuelve cuando la mesa ha sido agregada.
   */
  async agregarMesa(datosMesa: Omit<Mesa, 'mesaId'>): Promise<void> {
    try {
      // tableId se generará automáticamente por Firestore, o puedes pre-generarlo si es necesario
      // Aquí usamos addDoc para que Firestore genere el ID del documento
      await addDoc(this.mesasCollection, {
        ...datosMesa,
        assignedAt: datosMesa.assignedAt ? datosMesa.assignedAt.getTime() : null // Almacenar como timestamp de Unix
      });
      Swal.fire({
        icon: 'success',
        title: '¡Mesa Agregada!',
        text: `La mesa ${datosMesa.numeroMesa} ha sido agregada con éxito.`,
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
    } catch (error) {
      console.error('Error al agregar mesa:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar la mesa. Inténtelo de nuevo.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      throw error;
    }
  }
  obtenerMesas(estadoFiltro?: Mesa['estado']): Observable<Mesa[]> {
    let qRef: any = this.mesasCollection;
    if (estadoFiltro) {
      qRef = query(this.mesasCollection, where('estado', '==', estadoFiltro));
    }
    return collectionData(qRef, { idField: 'mesaId' }) as Observable<Mesa[]>;
  }


  async liberarMesa(uidUsuario: string): Promise<void> {
  try {
    // 1. Buscar la mesa asignada al usuario
    const q = query(collection(this.firestore, 'mesas'), where('currentClientId', '==', uidUsuario));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No se encontró una mesa asignada a este usuario.');
    }

    const docMesa = querySnapshot.docs[0];
    const idMesa = docMesa.id;

    // 2. Preparar los cambios: liberar la mesa
    const cambios = {
      estado: 'disponible',
      currentClientId: '',
      assignedAt: ''
    };

    const docRefMesa = doc(this.firestore, 'mesas', idMesa);
    await updateDoc(docRefMesa, cambios);

    // 3. Confirmación visual
    Swal.fire({
      icon: 'success',
      title: 'Mesa liberada',
      text: 'La mesa ha sido liberada con éxito.',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
      customClass: {
        popup: 'mi-alerta',
        confirmButton: 'btn-alerta',
        title: 'titulo-alerta',
        htmlContainer: 'texto-alerta'
      }
    });

  } catch (error) {
    console.error('Error al liberar la mesa:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo liberar la mesa. Inténtelo de nuevo.',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
      customClass: {
        popup: 'mi-alerta',
        confirmButton: 'btn-alerta',
        title: 'titulo-alerta',
        htmlContainer: 'texto-alerta'
      }
    });
  }
}

obtenerClientesEnEspera(estadoFiltro?: ClienteEnEspera['estado']): Observable<ClienteEnEspera[]> {
    let qRef: any = this.listaEsperaCollection;
   
    if (estadoFiltro) {
      
      qRef = query(this.listaEsperaCollection, where('estado', '==', estadoFiltro), orderBy('horaLlegada', 'asc')); // Ordenar por llegada
    } 
   
    return collectionData(qRef, { idField: 'id' }) as Observable<ClienteEnEspera[]>;
  }
  /**
   * Obtiene una mesa específica por su ID.
   * @param idMesa El ID de la mesa a buscar.
   * @returns Una promesa que resuelve con los datos de la mesa o null si no se encuentra.
   */
  async obtenerMesaPorId(idMesa: string): Promise<Mesa | null> {
    try {
      const q = query(this.mesasCollection, where('mesaId', '==', idMesa), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          mesaId: querySnapshot.docs[0].id, // Aseguramos que tableId sea el ID del documento
          numeroMesa: data['numeroMesa'],
          capacidad: data['capacidad'],
          estado: data['estado'],
          qrCodeUrl: data['qrCodeUrl'],
          currentClientId: data['currentClientId'] || null,
          assignedAt: data['assignedAt'] ? new Date(data['assignedAt']) : null
        } as Mesa;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener mesa por ID:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de una mesa existente.
   * @param idMesa El ID de la mesa a actualizar.
   * @param datos Un objeto con los campos a actualizar.
   * @returns Una promesa que resuelve cuando la mesa ha sido actualizada.
   */
  async actualizarMesa(idMesa: string, datos: Partial<Mesa>): Promise<void> {
    try {
      const docRefMesa = doc(this.firestore, 'mesas', idMesa);
      // Convertir assignedAt a timestamp si está presente
      if (datos.assignedAt instanceof Date) {
        datos.assignedAt = datos.assignedAt.getTime() as any; // Almacenar como timestamp de Unix
      }
      await updateDoc(docRefMesa, datos);
      Swal.fire({
        icon: 'success',
        title: '¡Mesa Actualizada!',
        text: `La mesa ${idMesa} ha sido actualizada con éxito.`,
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la mesa. Inténtelo de nuevo.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      throw error;
    }
  }

  /**
   * Elimina una mesa de la colección 'mesas'.
   * @param idMesa El ID de la mesa a eliminar.
   * @returns Una promesa que resuelve cuando la mesa ha sido eliminada.
   */
  async eliminarMesa(idMesa: string): Promise<void> {
    try {
      const docRefMesa = doc(this.firestore, 'mesas', idMesa);
      await deleteDoc(docRefMesa);
      Swal.fire({
        icon: 'success',
        title: '¡Mesa Eliminada!',
        text: `La mesa ${idMesa} ha sido eliminada con éxito.`,
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la mesa. Inténtelo de nuevo.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      throw error;
    }
  }


   // --- Métodos para Clientes en Espera ---

  /**
   * Agrega un nuevo cliente a la lista de espera.
   * @param cliente Los datos del cliente a agregar.
   * @returns Una promesa que resuelve cuando el cliente ha sido agregado.
   */
  async agregarClienteEnEspera(cliente: Omit<ClienteEnEspera, 'id'>): Promise<void> {
    try {
      await addDoc(this.listaEsperaCollection, {
        ...cliente,
        horaLlegada: cliente.horaLlegada.getTime() // Almacenar como timestamp de Unix
      });
      Swal.fire({
        icon: 'success',
        title: '¡Cliente en Espera!',
        text: `El cliente ${cliente.nombre} ha sido añadido a la lista de espera.`,
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
    } catch (error) {
      console.error('Error al agregar cliente en espera:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el cliente a la lista de espera. Inténtelo de nuevo.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
        customClass: {
          popup: 'mi-alerta',
          confirmButton: 'btn-alerta',
          title: 'titulo-alerta',
          htmlContainer: 'texto-alerta'
        }
      });
      throw error;
    }
  }

  /**
   * Obtiene los clientes de la lista de espera, opcionalmente filtrados por estado.
   * @param estadoFiltro (Opcional) El estado por el cual filtrar (e.g., 'esperando', 'asignado').
   * @returns Un Observable que emite un array de clientes en espera.
   */
  

  /**
   * Actualiza el estado o datos de un cliente en la lista de espera.
   * @param clienteId El ID del cliente a actualizar.
   * @param datos Un objeto con los campos a actualizar.
   * @returns Una promesa que resuelve cuando el cliente ha sido actualizado.
   */
  async actualizarClienteEnEspera(clienteId: string, datos: Partial<ClienteEnEspera>): Promise<void> {
    try {
      const docRefCliente = doc(this.firestore, 'lista-espera', clienteId);
      if (datos.horaLlegada instanceof Date) {
        datos.horaLlegada = datos.horaLlegada.getTime() as any;
      }
      await updateDoc(docRefCliente, datos);
      // No mostrar Swal aquí para cada actualización de estado, el componente lo manejará si es necesario.
    } catch (error) {
      console.error('Error al actualizar cliente en espera:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el cliente en espera. Inténtelo de nuevo.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
  customClass: {
    popup: 'mi-alerta',
    confirmButton: 'btn-alerta',
    title: 'titulo-alerta',
    htmlContainer: 'texto-alerta'
  }
      });
      throw error;
    }
  }

  /**
   * Elimina un cliente de la lista de espera.
   * @param clienteId El ID del cliente a eliminar.
   * @returns Una promesa que resuelve cuando el cliente ha sido eliminado.
   */
  async eliminarClienteEnEspera(clienteId: string): Promise<void> {
    try {
      const docRefCliente = doc(this.firestore, 'lista-espera', clienteId);
      await deleteDoc(docRefCliente);
      Swal.fire({
        icon: 'success',
        title: '¡Cliente Removido!',
        text: `El cliente ha sido removido de la lista de espera.`,
        confirmButtonText: 'Aceptar',
        heightAuto: false,
  customClass: {
    popup: 'mi-alerta',
    confirmButton: 'btn-alerta',
    title: 'titulo-alerta',
    htmlContainer: 'texto-alerta'
  }
      });
    } catch (error) {
      console.error('Error al eliminar cliente en espera:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el cliente de la lista de espera. Inténtelo de nuevo.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
  customClass: {
    popup: 'mi-alerta',
    confirmButton: 'btn-alerta',
    title: 'titulo-alerta',
    htmlContainer: 'texto-alerta'
  }
      });
      throw error;
    }
  }

  async obtenerMesaPorUidUsuario(uid: string): Promise<Mesa | null> {
    try {
      const mesasRef = collection(this.firestore, 'mesas');
      const q = query(mesasRef, where('currentClientId', '==', uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No se encontró ninguna mesa para este UID.');
        return null;
      }

      const mesaDoc = querySnapshot.docs[0];
      const data = mesaDoc.data();

      return {
        mesaId: mesaDoc.id,
        ...data
      } as Mesa;
    } catch (error) {
      console.error('Error obteniendo la mesa:', error);
      throw error;
    }
  }

  async getListaPedidos()
  {
    try {
    const pedidosRef = collection(this.firestore, 'pedidos');
    const querySnapshot = await getDocs(pedidosRef);

    const listaPedidos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return listaPedidos;
  } catch (error) {
    console.error('Error al obtener la lista de pedidos:', error);
    throw error;
  }
  }


 async modificarEstadoPedido(campo: string, nuevoValor: any, pedido: any) {
  try {
    if (!pedido.id) {
      console.error('El pedido no tiene un ID válido');
      return;
    }

    const pedidoDocRef = doc(this.firestore, 'pedidos', pedido.id);

    const updateData: any = {};
    updateData[campo] = nuevoValor;

    await updateDoc(pedidoDocRef, updateData);

    console.log(`Campo '${campo}' actualizado correctamente.`);
  } catch (error) {
    console.error('Error al modificar el pedido:', error);
    throw error;
  }
}

async obtenerPedidosParaUsuario(rol: 'cocinero' | 'bartender'): Promise<Pedido[]> {
  try {
    console.log(rol)
    const pedidosRef = collection(this.firestore, 'pedidos');
    const q = query(pedidosRef, where('estadoPedido', '!=', 'Pendiente')); // asumí 'En proceso' porque no hay 'En preparacion'

    const querySnapshot = await getDocs(q);

    const pedidosFiltrados: Pedido[] = querySnapshot.docs
      .map(doc => {
        const data = doc.data() as unknown;
        return { id: doc.id, ...(data as Pedido) };
      }).filter(pedido => {
        if (!Array.isArray(pedido.productosSolicitados)) return false;

        if (rol === 'cocinero') {
          return pedido.productosSolicitados.some(
            producto => producto.tipoProducto === 'comida' || producto.tipoProducto === 'postre'
          );
        }

        if (rol === 'bartender') {
          return pedido.productosSolicitados.some(
            producto => producto.tipoProducto === 'bebida'
          );
        }

        return false;
      });
      console.log("PEDIDOS FILTRADOS",pedidosFiltrados);
    return pedidosFiltrados;

  } catch (error) {
    console.error('Error al obtener pedidos filtrados:', error);
    throw error;
  }
}


async modificarEstadoProductos(pedido: any, rol: string, estadoProducto: string) {
  try {
    const tiposCocinero = ['comida', 'postre'];
    const tiposBartender = ['bebida'];
    const tiposPermitidos = rol === 'cocinero' ? tiposCocinero : tiposBartender;

    // 1. Actualizar productos según el rol
    const productosActualizados = pedido.productosSolicitados.map((producto: any) => {
      if (tiposPermitidos.includes(producto.tipoProducto)) {
        return {
          ...producto,
          estadoPreparacion: estadoProducto
        };
      }
      return producto;
    });

    const pedidoRef = doc(this.firestore, 'pedidos', pedido.id);

    // 2. Subir los productos actualizados
    await updateDoc(pedidoRef, {
      productosSolicitados: productosActualizados
    });

    console.log('Productos actualizados con éxito');

    // 3. Verificar si todos están terminados
    const todosTerminados = productosActualizados.every(
      (producto: any) => producto.estadoPreparacion === 'Terminado'
    );

    if (todosTerminados) {
      // 4. Si todos están terminados, cambiar estado del pedido
      await updateDoc(pedidoRef, {
        estadoPedido: 'Para entregar'
      });

      console.log('Pedido marcado como "Para entregar"');
    }

  } catch (error) {
    console.error('Error al preparar el pedido:', error);
  }
}


async getListaPedidosPorCliente(uid: string): Promise<Pedido[]> {
  try {
    const pedidosRef = collection(this.firestore, 'pedidos');
    const q = query(pedidosRef, where('clienteUid', '==', uid));
    const querySnapshot = await getDocs(q);

    const pedidos: Pedido[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Pedido)
    }));

    return pedidos;
  } catch (error) {
    console.error('Error al obtener los pedidos por cliente:', error);
    throw error;
  }
}

/**LOGICA PARA EL CHAAAAT */

  async iniciarNuevaSesionChatMesa(mesaId: string, clienteUid: string, clienteNombre: string): Promise<string> {
    const historialSesionesRef = collection(this.firestore, 'chats_mesas', mesaId, 'historial_sesiones');
    // Crea un nuevo documento de sesión con un timestamp y el estado activa
    const nuevaSesionDocRef = await addDoc(historialSesionesRef, {
      fechaInicio: new Date(),
      activa: true,
      clienteUid: clienteUid,
      clienteNombre: clienteNombre,
      messages: [] // Inicializa el array de mensajes vacío
    });
    return nuevaSesionDocRef.id;
  }

    async appendChatMessageToTableSession(mesaId: string, sesionId: string, newMessage: any) {
    const chatDocRef = doc(this.firestore, 'chats_mesas', mesaId, 'historial_sesiones', sesionId);

    // Usa arrayUnion para agregar el nuevo mensaje al array 'messages'
    await updateDoc(chatDocRef, {
      messages: arrayUnion(newMessage)
    });
  }

  getAllMessagesFromTableSession(mesaId: string, sesionId: string, callback: (messages: any[]) => void) {
    const chatDocRef = doc(this.firestore, 'chats_mesas', mesaId, 'historial_sesiones', sesionId);

    // onSnapshot es parte del SDK modular de Firestore, y emite snapshots.
    return onSnapshot(chatDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data?.['messages'] || []);
      } else {
        callback([]); // Si la sesión o el documento no existe, no hay mensajes.
      }
    });
  }
  async obtenerNombreDeUsuario(uid: string): Promise<string | null> {
    const userDocRef = doc(this.firestore, 'usuarios', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists() && docSnap.data()['nombre']) {
      return docSnap.data()['nombre'];
    }
    return null;
  }

  async archivarSesionChatMesa(mesaId: string, sesionId: string) {
    const sesionDocRef = doc(this.firestore, 'chats_mesas', mesaId, 'historial_sesiones', sesionId);
    await updateDoc(sesionDocRef, {
      activa: false, // Marca la sesión como inactiva
      fechaFin: new Date()
    });
  }

async getActiveTableSessionsForMozo(){
  const mesasSnapshot = await getDocs(collection(this.firestore, 'mesas'));
  const activeSessions: { mesaId: string, sesionId: string, clienteNombre?: string, numeroMesa: string }[] = [];

  for (const mesaDoc of mesasSnapshot.docs) {
    const mesaId = mesaDoc.id;
    const numeroMesa = await this.obtenerNumeroMesaPorDocId(mesaId) as string;
    const historialSesionesRef = collection(this.firestore, 'chats_mesas', mesaId, 'historial_sesiones');
    const q = query(
      historialSesionesRef,
      where('activa', '==', true),
      orderBy('fechaInicio', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const sesionDoc = querySnapshot.docs[0];
      const sesionData = sesionDoc.data();

      activeSessions.push({
        mesaId: mesaId,
        sesionId: sesionDoc.id,
        clienteNombre: sesionData['clienteNombre'],
        numeroMesa: numeroMesa
      });
    }
  }

  return activeSessions;
}


  async getClientActiveChatSessionId(mesaId: string, clientUid: string): Promise<string | null> {
    const historialSesionesRef = collection(this.firestore, 'chats_mesas', mesaId, 'historial_sesiones');
    const q = query(
      historialSesionesRef,
      where('activa', '==', true),
      where('clienteUid', '==', clientUid), // Filtra por el cliente específico
      orderBy('fechaInicio', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    return null;
  }
  async obtenerNumeroMesaPorDocId(docId: string): Promise<string | null> {
  try {
    const docRef = doc(this.firestore, `mesas/${docId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data['numeroMesa'] || null;
    } else {
      console.warn('No se encontró la mesa con ese ID');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener número de mesa:', error);
    return null;
  }
}





}



