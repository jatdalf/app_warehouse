import type { PickingItem } from "../picking/PickingItem";
import type { Remito } from "./Remito";
import type { Destino } from "./Destino";
import { formatPrintDate } from "../shared/DateFormatter";
import { RemitoProductsBuilder } from "./RemitoProductsBuilder";

export class RemitoFactory {
    static create(
        numero: string,
        pedido: string,
        destinoNombre: string,
        picking: PickingItem[],
        destinos: Record<string, Destino>
    ): Remito {
        const destino = destinos[destinoNombre] ?? {
            domicilio: "",
            localidad: "",
            cp: ""
        };

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

    static build(picking: PickingItem[], numeros: Map<string, string>, destinos: Record<string, Destino>
    ): Remito[] {
        const grupos = new Map<string, PickingItem[]>();
        for (const item of picking) {
            if (!grupos.has(item.st)) {
                grupos.set(item.st, []);
            }
            grupos.get(item.st)!.push(item);
        }
        return [...grupos.entries()].map(([st, items]) => {
                const numeroRemito = numeros.get(st) ?? "99999999";
                return this.create(
                    numeroRemito,
                    st,
                    items[0].destino,
                    items,
                    destinos
                );
            }
        );
    }
}