import type { PickingItem } from "../core/picking/PickingItem";
import type { SalidaInforRow } from "./infor/SalidaInforRow";

export function generarMovimientosInfor(picking: PickingItem[]): SalidaInforRow[] {

    const agrupado = new Map<string, SalidaInforRow>();

    for (const item of picking) {
        const key = `${item.st}|${item.sku}`;
        const existente = agrupado.get(key);
        if (existente) {
            existente.bultos = Number(existente.bultos) + Number(item.bultos);
            continue;
        }

        agrupado.set(key, {
            st: item.st,
            sku: item.sku,
            bultos: item.bultos,
            storeName: item.destino
        });
    }

    return [...agrupado.values()];
}