import type { OrderItem } from "../orders/OrderItem";
import type { StockItem } from "../stock/StockItem";
import type { PickingItem } from "../picking/PickingItem";
import type { StockShortage } from "../stock/StockShortage";
import type { PickingStats } from "../picking/PickingStats";

export class WarehouseSession {
    pedidos: OrderItem[] = [];
    stock: StockItem[] = [];
    picking: PickingItem[] = [];
    shortages: StockShortage[] = [];
    stats?: PickingStats;
    remitos: any[] = [];
    movimientos: any[] = [];
}