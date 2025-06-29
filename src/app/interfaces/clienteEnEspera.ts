export interface ClienteEnEspera {
    id: string; // ID del documento en Firestore
    nombre: string;
    cantidadPersonas: number;
    telefono?: string; // Opcional, para contacto
    horaLlegada: Date;
    estado: 'esperando' | 'asignado' | 'cancelado';
}