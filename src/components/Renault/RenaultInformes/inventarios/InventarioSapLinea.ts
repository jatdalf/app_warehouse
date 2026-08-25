export interface InventarioSapLinea {
    id: number;
    documento: string;
    fecha: Date;
    referencia: string;
    posicion: string;
    material: string;
    descripcion: string;
    stockCantidad: number;
    stockValor: number;
    diferenciaCantidad: number;
    diferenciaValor: number;
    diferenciaValorAbsoluto: number;
}