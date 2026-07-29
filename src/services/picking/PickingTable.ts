import type { PickingItem } from "../../core/picking/PickingItem";
import { LocationComparer } from "../../core/shared/LocationComparer";
import { buildPickingRow } from "./PickingRow";

export function buildPickingTable(items: PickingItem[]): string {
    const grupos = agruparPorSector(items);
    return grupos
        .map(([sector, filas]) => `
            <div class="sector">
                <div class="sectorTitle">
                    PASILLO ${sector}
                </div>
                <table class="pickingTable">
                    <thead>
                        <tr>
                            <th class="locationHeader">
                                Ubicación
                            </th>
                            <th class="barcodeHeader">
                                SKU
                            </th>
                            <th class="descriptionHeader">
                                Descripción
                            </th>
                            <th class="qtyHeader">
                                Bultos
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filas
                            .map(buildPickingRow)
                            .join("")}
                    </tbody>
                </table>
            </div>
        `)
        .join("");
}

function agruparPorSector(
    items: PickingItem[]
): Array<[string, PickingItem[]]> {
    const ordenados = [...items].sort(
        (a, b) =>
            LocationComparer.compare(
                a.ubicacion,
                b.ubicacion
            )
    );
    const grupos = new Map<string, PickingItem[]>();
    for (const item of ordenados) {
        const sector =
            LocationComparer.getSector(
                item.ubicacion
            );
        if (!grupos.has(sector)) {
            grupos.set(sector, []);
        }
        grupos.get(sector)!.push(item);
    }
    return [...grupos.entries()];
}