import type { PickingItem } from "../../core/picking/PickingItem";
import type { Remito } from "../../core/remitos/Remito";
import { RemitoFactory } from "../../core/remitos/RemitoFactory";

export class RemitoBuilder {
    static build(
        picking: PickingItem[]
    ): Remito[] {
        const grupos = new Map<string,PickingItem[]>();
        for (const item of picking) {
            if (!grupos.has(item.st)) {
                grupos.set(item.st, []);           
            }
            grupos.get(item.st)!.push(item);
        }
        let numero = 1;
        return [...grupos.entries()].map(([st, items]) => {
                const numeroRemito =
                    `R0003-${String(numero++)
                        .padStart(8, "0")}`;
                return RemitoFactory.create(
                    numeroRemito,
                    st,
                    items[0].destino,
                    items
                );
            }
        );
    }
}