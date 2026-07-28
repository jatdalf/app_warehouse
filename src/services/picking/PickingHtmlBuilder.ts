import type { PickingItem } from "../../core/picking/PickingItem";

export function buildPickingHtml(
    picking: PickingItem[]
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <title>Picking</title>
    <style>
    body{
        font-family:Arial;
        margin:25px;
    }
    table{
        width:100%;
        border-collapse:collapse;
    }
    th,
    td{
        border:1px solid #000;
        padding:6px;
    }
    th{
        background:#efefef;
    }
    </style>
    </head>
    <body>
    <h2>Picking</h2>
    <table>
    <tr>
    <th>ST</th>
    <th>Ubicación</th>
    <th>SKU</th>
    <th>Descripción</th>
    <th>Cantidad</th>
    </tr>
    ${picking.map(item=>`
    <tr>
    <td>${item.st}</td>
    <td>${item.ubicacion}</td>
    <td>${item.sku}</td>
    <td>${item.descripcion}</td>
    <td>${item.cantidad}</td>
    </tr>
    `).join("")}
    </table>
    </body>
    </html>
    `;
}