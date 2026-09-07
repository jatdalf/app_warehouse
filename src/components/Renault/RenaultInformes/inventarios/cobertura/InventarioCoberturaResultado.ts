export interface InventarioCoberturaStorage {
    storage: string;
    totalPosiciones: number;
    posicionesInventariadas: number;
    posicionesPendientes: number;
    porcentajeCobertura: number;
    /* Posiciones inventariadas de este storage sobre el total de posiciones del warehouse. */
    porcentajeWarehouse: number;
}

export interface InventarioCoberturaPendiente {
    storage: string;
    ubicacion: string;
    material: string;
    cantidad: number;
}

export interface InventarioCoberturaResultado {
    totalPosiciones: number;
    posicionesInventariadas: number;
    posicionesPendientes: number;
    porcentajeCobertura: number;
    /* Cantidad de registros de inventario encontrados antes de eliminar ubicaciones repetidas. */
    conteosRealizados: number;
    /* Cuántos conteos adicionales hubo sobre ubicaciones ya contadas. */
    reconteos: number;
    /* Cuando filtramos un storage:
     * posiciones inventariadas del storage
     * -------------------------------------
     * posiciones totales del warehouse */
    porcentajeWarehouse: number;
    pendientes: InventarioCoberturaPendiente[];
    resumenPorStorage: InventarioCoberturaStorage[];
}