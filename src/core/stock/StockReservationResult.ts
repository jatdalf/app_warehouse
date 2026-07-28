import type { StockItem } from "./StockItem";

export interface StockReservationResult {
    success: boolean;
    reservado: number;
    disponible: number;
    item?: StockItem;
    motivo?:
        | "NOT_FOUND"
        | "INSUFFICIENT_STOCK";
}