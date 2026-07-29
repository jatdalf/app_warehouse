import type { PickingItem } from "../../core/picking/PickingItem";

export function buildPickingRow(item: PickingItem): string {
    return `
        <tr>
            <td class="location">
                ${item.ubicacion}
            </td>
            <td class="barcodeColumn">
                <div class="barcodeFont">
                    *${item.sku}*
                </div>
                <div class="barcodeText">
                    ${item.sku}
                </div>
            </td>
            <td class="description">
                ${item.descripcion}
            </td>
            <td class="qty">
                ${item.bultos}
            </td>
        </tr>
    `;
}