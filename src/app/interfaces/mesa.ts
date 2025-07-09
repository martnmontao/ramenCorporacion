export interface Mesa {
    mesaId: string;
    numeroMesa: number;
    capacidad: number;
    tipo: 'estandar' | 'VIP' | 'apta-movilidad-reducida'
    estado: 'disponible' | 'ocupada' | 'reservada' ; // O los estados que definas
    qrCodeUrl: string;
    currentClientId: string | null;
    assignedAt: Date | null;
    fotoMesa: string; // Usar Date para timestamps
}