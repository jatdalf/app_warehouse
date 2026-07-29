import type { PickingGroup } from "./PickingGroup";
import { buildPickingHeader } from "./PickingHeader";
import { buildFooter } from "./PickingFooter";
import { buildPickingTable } from "./PickingTable";

export function buildPickingPage(
    grupo: PickingGroup,
    pagina: number,
    total: number
): string {
    return `
        <div class="page">
            ${buildPickingHeader(grupo.st, grupo.destino, grupo.items.length)}
            <div class="pageContent">
                ${buildPickingTable(grupo.items)}
            </div>
            ${buildFooter(grupo, pagina, total)}
        </div>
    `;
}