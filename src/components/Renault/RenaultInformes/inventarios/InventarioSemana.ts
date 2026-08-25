import type { InventarioDia } from "./InventarioDia";

export interface InventarioSemana {
    key: string;
    label: string;
    desde: Date;
    hasta: Date;
    dias: InventarioDia[];
}