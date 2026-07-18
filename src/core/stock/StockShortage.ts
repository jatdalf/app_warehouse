export interface StockShortage {
    st: string;
    sku: string;
    descripcion: string;
    solicitado: number;
    asignado: number;
    faltante: number;
}