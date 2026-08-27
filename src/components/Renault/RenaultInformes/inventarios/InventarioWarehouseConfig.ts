export type WarehouseInventario = | "W1" | "W2";

export interface WarehouseInventarioConfig {
    label: string;
    zsappr110FileId: string;
    lx22FileId: string;
    targetDiario: number;
}

export const INVENTARIO_WAREHOUSES:
    Record<WarehouseInventario, WarehouseInventarioConfig> = {
    W1: {
        label: "W1 (Rep)",
        zsappr110FileId: "1K_YcmQmaz1PDG6-AM5d1_PWrKdv5rTx6",
        lx22FileId: "1V-G3jMN3G-Y58ZpbN86Ho34BtFVGd31e",
        targetDiario: 135
    },
    W2: {
        label: "W2 (BsAs)",
        zsappr110FileId: "1HTVCA3mmQ1x-sEz6SRJIv4zb1-0fMui1",
        lx22FileId: "1NHk9EO4maktBRfwUP5phvtLZrr1ajxKO",
        targetDiario: 90
    }
};