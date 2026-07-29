import type { PickingItem } from "../../core/picking/PickingItem";

export interface PickingGroup{
    st:string;
    destino:string;
    items:PickingItem[];
}