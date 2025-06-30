export interface Pedido
{
    idMesa: number;
    numeroMesa: number;
    clienteUid : string;
    productosSolicitados : [{nombreProducto: string, tipoProducto: string, precioProducto: number}],
    estadoPedido: 'Pendiente' | 'En proceso' | 'Entregado';
    importeTotal: number,
    pagado: 'Pagado' | 'No pagado'; 
}