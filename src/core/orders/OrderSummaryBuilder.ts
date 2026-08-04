import type { OrderItem } from "./OrderItem";

export interface OrderSummary {
    sku: number;
    lineas: number;
    bultos: number;
}

export class OrderSummaryBuilder {
    static build(orders: OrderItem[]): OrderSummary {
        const sku = new Set(orders.map(o => o.sku)).size;
        const lineas = orders.length;
        const bultos = orders.reduce((acc, o) => acc + o.bultos, 0);
        return {
            sku,
            lineas,
            bultos
        };
    }
}