import type { PickingItem } from "./PickingItem";

export interface PickingSummary {
    sku: number;
    lineas: number;
    bultos: number;
}

export class PickingSummaryBuilder {
    static build(picking: PickingItem[]): PickingSummary {
        const sku = new Set(picking.map(p => p.sku)).size;
        const lineas = picking.length;
        const bultos = picking.reduce((acc, p) => acc + p.bultos, 0);
        return {
            sku,
            lineas,
            bultos
        };
    }
}