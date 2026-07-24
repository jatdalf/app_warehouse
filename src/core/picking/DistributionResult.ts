import type { PickingItem } from "./PickingItem";

export interface DistributionResult {
    items: PickingItem[];
    pendiente: number;
}