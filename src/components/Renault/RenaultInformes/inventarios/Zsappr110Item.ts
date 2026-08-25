export interface Zsappr110Item {
    id: number;
    documento: string;
    item: string;
    posicion: string;
    material: string;
    descripcion: string;
    stockCantidad: number;
    stockValor: number;
    ultimoRecuentoCantidad: number;
    ultimoRecuentoValor: number;
    diferenciaCantidad: number;
    diferenciaPorcentaje: number;
    diferenciaValor: number;
    diferenciaValorAbsoluto: number;
}
export interface InventarioDia {
    fecha: Date;
    label: string;
    realizados: number;
    target: number;
    porReferencia: Record<string, number>;
}

export interface InventarioSemana {
    key: string;
    label: string;
    desde: Date;
    hasta: Date;
    dias: InventarioDia[];
}