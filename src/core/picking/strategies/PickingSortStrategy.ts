import type { StockItem } from "../../stock/StockItem";

export interface PickingSortStrategy {
    sort(stock: StockItem[]): StockItem[];
}