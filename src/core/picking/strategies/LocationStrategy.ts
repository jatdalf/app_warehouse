import type { StockItem } from "../../stock/StockItem";
import type { PickingSortStrategy } from "./PickingSortStrategy";
import { WarehouseLocation } from "./WarehouseLocation";

export class LocationStrategy implements PickingSortStrategy {
    sort(stock: StockItem[]): StockItem[] {
        return [...stock].sort((a, b) =>
            WarehouseLocation.compareByLocation(
                WarehouseLocation.parse(a.ubicacion), WarehouseLocation.parse(b.ubicacion)
            )
        );
    }
}