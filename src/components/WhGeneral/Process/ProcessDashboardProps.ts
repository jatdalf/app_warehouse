import type { StockItem } from "../../../core/stock/StockItem";
import type { OrderItem } from "../../../core/orders/OrderItem";
import type { PickingMethod } from "../../../core/picking/strategies/PickingMethod";

export interface StockCardProps {
    fileName: string;
    onLoaded(items: StockItem[], fileName: string, lastModified: number): void;
    onError(message: string): void;
}

export interface OrdersCardProps {
    onLoaded(items: OrderItem[]): void;
    onError(message: string): void;
}

export interface ExecutionCardProps {
    method: PickingMethod;
    onMethodChange(method: PickingMethod): void;
    enabled: boolean;
    onExecute(): void;
}

export interface PickingCardProps {
    enabled: boolean;
    onPrint(): void;
}

export interface RemitoCardProps {
    enabled: boolean;
    onPrint(): void;
}

export interface ExportCardProps {
    enabled: boolean;
    onExport(): void;
}
export interface PickingCardProps {
    onPrint(): void;
    enabled: boolean;
}