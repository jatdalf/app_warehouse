import type { StockItem } from "./StockItem";
import type { StockReservationResult } from "./StockReservationResult";
import { LocationComparer } from "../shared/LocationComparer";

export class StockIndex {
    private readonly stock: StockItem[];
    private readonly index: Map<string, StockItem>;
    private readonly skuIndex: Map<string, StockItem[]>;
    constructor(stock: StockItem[]) {
        this.stock = stock.map(s => ({ ...s }));
        this.index = new Map();
        this.skuIndex = new Map();
        for (const item of this.stock) {
            this.index.set(
                item.articulo,
                item
            );
            const lista =
                this.skuIndex.get(item.articulo);
            if (lista) {
                lista.push(item);
            } else {
                this.skuIndex.set(
                    item.articulo,
                    [item]
                );
            }
        }
    }

    buscar(sku: string): StockItem | undefined {
        return this.index.get(sku);
    }

    reservar(
        sku: string,
        cantidad: number
    ): StockReservationResult {
        const item = this.index.get(sku);
        if (!item) {
            return {
                success: false,
                reservado: 0,
                disponible: 0,
                motivo: "NOT_FOUND"
            };
        }
        if (item.stock < cantidad) {
            return {
                success: false,
                reservado: 0,
                disponible: item.stock,
                motivo: "INSUFFICIENT_STOCK"
            };
        }
        item.stock -= cantidad;
        return {
            success: true,
            reservado: cantidad,
            disponible: item.stock,
            item
        };
    }

    getStock(): StockItem[] {
        return this.stock;
    }

    obtenerUbicaciones(sku: string): StockItem[] {
        return this.stock
            .filter(item => item.articulo === sku)
            .sort((a, b) =>
                LocationComparer.compare(a.ubicacion, b.ubicacion)
            );
    }
}