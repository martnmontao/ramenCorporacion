export interface Pedido
{
    
    idMesa: number;
    numeroMesa: number;
    clienteUid : string;
    productosSolicitados: {
    nombreProducto: string;
    tipoProducto: string;
    precioProducto: number;
    tiempoPreparacion: string;
    estadoPreparacion: boolean;
    }[],
    estadoPedido: 'Pendiente' | 'En preparacion' | 'Entregado';
    importeTotal: number,
    pagado: 'Pagado' | 'No pagado'; 
}