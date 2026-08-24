import type { StockItem } from "../../stock/StockItem";
import type { PickingSortStrategy } from "./PickingSortStrategy";
import { WarehouseLocation } from "./WarehouseLocation";

export class LocationStrategy
    implements PickingSortStrategy {
    sort(stock: StockItem[]): StockItem[] {
        return [...stock].sort((a, b) => {
            const fechaA = a.fechaVencimiento?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const fechaB = b.fechaVencimiento?.getTime() ?? Number.MAX_SAFE_INTEGER;
            // 1. FEFO
            if (fechaA !== fechaB) {
                return fechaA - fechaB;
            }
            // 2. Recorrido
            return WarehouseLocation.compareByLocation(
                WarehouseLocation.parse(a.ubicacion),
                WarehouseLocation.parse(b.ubicacion)
            );
        });
    }
}