import type { StockItem } from "../../../core/stock/StockItem";
import type { OrderItem } from "../../../core/orders/OrderItem";
import type { PickingMethod } from "../../../core/picking/strategies/PickingMethod";

export interface StockCardProps {
    onLoaded(items: StockItem[]): void;
}

export interface OrdersCardProps {
    onLoaded(items: OrderItem[]): void;
}

export interface ExecutionCardProps {
    method: PickingMethod;
    onMethodChange(method: PickingMethod): void;
    enabled: boolean;
    onExecute(): void;
}