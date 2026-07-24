import type { PickingItem } from "./PickingItem";
import type { PickingStats } from "./PickingStats";
import type { StockItem } from "../stock/StockItem";
import type { StockShortage } from "../stock/StockShortage";

export interface PickingProcessResult {
    picking: PickingItem[];
    stockActualizado: StockItem[];
    shortages: StockShortage[];
    stats: PickingStats;

}