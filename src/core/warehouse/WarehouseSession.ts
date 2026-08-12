import type { OrderItem } from "../orders/OrderItem";
import type { StockItem } from "../stock/StockItem";
import type { PickingItem } from "../picking/PickingItem";
import type { StockShortage } from "../stock/StockShortage";
import type { PickingStats } from "../picking/PickingStats";
import { PickingMethods } from "../picking/strategies/PickingMethod";
import type { PickingMethod } from "../picking/strategies/PickingMethod";

export class WarehouseSession {
    pedidos: OrderItem[] = [];
    stock: StockItem[] = [];
    picking: PickingItem[] = [];
    shortages: StockShortage[] = [];
    stats?: PickingStats;
    remitos: any[] = [];
    remitoNumeracionProvisoria: boolean = false;
    movimientos: any[] = [];
    pickingMethod: PickingMethod = PickingMethods.LOCATION;
}