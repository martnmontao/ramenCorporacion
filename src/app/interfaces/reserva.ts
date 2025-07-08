export interface Reserva {
    reservaId?: string; 
    clienteUid: string;
    clienteNombre: string;
    fechaHora: Date; 
    cantidadPersonas: number;
    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'expirada';
    notas?: string;
    mesaAsignada?: string; // New: ID of the assigned table (mesaId)
    horaConfirmacion?: Date; // New: Timestamp when the reservation was confirmed
}

