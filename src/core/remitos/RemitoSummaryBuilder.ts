import type { Remito } from "./Remito";

export interface RemitoSummary {
    documentos: number;
    destinos: number;
    bultos: number;
}

export class RemitoSummaryBuilder {
    static build(remitos: Remito[]): RemitoSummary {
        const documentos = remitos.length;
        const destinos = new Set(remitos.map(r => r.destinoNombre)).size;
        const bultos = remitos.reduce((acc, remito) =>
                acc +
                remito.productos.reduce((a, p) => a + p.bultos, 0),
            0
        );
        return {
            documentos,
            destinos,
            bultos
        };
    }
}