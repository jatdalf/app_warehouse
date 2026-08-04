import type { PickingItem } from "../picking/PickingItem";
import type { Remito } from "./Remito";
import { DESTINOS } from "./RemitoConfig";
import { formatPrintDate } from "../shared/DateFormatter";
import { RemitoProductsBuilder } from "./RemitoProductsBuilder";

export class RemitoFactory {
    static create(
        numero: string,
        pedido: string,
        destinoNombre: string,
        picking: PickingItem[]
    ): Remito {
        const destino = DESTINOS[destinoNombre];
        if (!destino) {
            throw new Error(
                `Destino no configurado: ${destinoNombre}`
            );
        }
        return {
            numero,
            copia: "ORIGINAL",
            fecha: formatPrintDate(),
            pedido,
            destinoNombre,
            destino,
            productos: RemitoProductsBuilder.build(
                picking
            )
        };
    }

    static build(picking: PickingItem[]): Remito[] {
        const grupos = new Map<string, PickingItem[]>();
        for (const item of picking) {
            if (!grupos.has(item.st)) {
                grupos.set(item.st, []);
            }
            grupos.get(item.st)!.push(item);
        }
        let numero = 1;
        return [...grupos.entries()].map(([st, items]) => {
            const numeroRemito =
                numero.toString().padStart(8, "0");
            numero++;
            return this.create(
                numeroRemito,
                st,
                items[0].destino,
                items
            );
        });
    }
}