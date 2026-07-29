import type { PickingItem } from "../../core/picking/PickingItem";
import { buildPickingPage } from "./PickingPage";
import { PICKING_STYLES } from "./PickingStyles";
import type { PickingGroup } from "./PickingGroup";

function buildPickingGroups(picking: PickingItem[]): PickingGroup[] {
    const grupos = new Map<string, PickingGroup>();
    for (const item of picking) {
        if (!grupos.has(item.st)) {
            grupos.set(item.st, {
                st: item.st,
                destino: item.destino,
                items: []
            });
        }
        grupos.get(item.st)!.items.push(item);
    }
    return [...grupos.values()];
}

export function buildPickingHtml(picking: PickingItem[]): string {
    const grupos = buildPickingGroups(picking);
    return `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
        <style>
            ${PICKING_STYLES}
        </style>
        </head>
        <body>
            ${grupos
                .map((grupo, index) =>
                    buildPickingPage(
                        grupo,
                        index + 1,
                        grupos.length
                    )
                )
                .join("")}
        </body>
        </html>
    `;
}