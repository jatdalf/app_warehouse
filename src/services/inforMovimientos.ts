    import type { PickingItem } from "../core/picking/PickingItem";
    import type { SalidaInforRow } from "./infor/SalidaInforRow";

    export function generarMovimientosInfor(
        picking: PickingItem[]
    ): SalidaInforRow[] {

        return picking.map(item => ({
            st: item.st,
            sku: item.sku,
            bultos: item.bultos,
            storeName: item.destino
        }));

    }   