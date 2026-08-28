export interface CompactacionUbicacion {
    ubicacion: string;
    cantidad: number;
}

export interface CompactacionPropuestaUbicacion {
    ubicacion: string;
    cantidadActual: number;
    cantidadPropuesta: number;
    liberada: boolean;
}

export interface CompactacionMovimiento {
    desde: string;
    hacia: string;
    cantidad: number;
}

export interface CompactacionCandidato {
    storage: string;
    material: string;
    cantidadTotal: number;
    capacidadObservada: number;
    ubicacionesActuales: number;
    ubicacionesNecesarias: number;
    ubicacionesLiberables: number;
    ubicaciones: CompactacionUbicacion[];
    propuesta: CompactacionPropuestaUbicacion[];
    movimientos: CompactacionMovimiento[];
}

export interface CompactacionStorage {
    storage: string;
    materialesCandidatos: number;
    ubicacionesLiberables: number;
}

export interface CompactacionResumen {
    totalMaterialesCandidatos: number;
    totalUbicacionesLiberables: number;
    porStorage: CompactacionStorage[];
    candidatos: CompactacionCandidato[];
}