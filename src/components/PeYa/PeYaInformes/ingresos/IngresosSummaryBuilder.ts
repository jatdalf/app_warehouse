import type { IngresoItem } from "./IngresoItem";

export interface IngresosSummary {
    sku: number;
    unidades: number;
    pallets: number;
}

export class IngresosSummaryBuilder {

    static build(items: IngresoItem[]): IngresosSummary {
        const sku = new Set(items.map(item => item.sku)).size;

        const unidades = items.reduce((total, item) => total + item.qtyReceived, 0);

        const pallets = items.filter(item => item.toLoc !== "").length;

        return {
            sku,
            unidades,
            pallets
        };
    }
}