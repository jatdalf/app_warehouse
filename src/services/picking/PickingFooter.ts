import type { PickingGroup } from "./PickingGroup";

export function buildFooter(grupo: PickingGroup, pedidoActual: number, totalPedidos: number): string {
    console.log(pedidoActual, totalPedidos)
    return `
        <div class="footerBox">
            <div class="summary">
                <div>
                    <strong>Pedido:</strong>
                    ${grupo.st}
                </div>
                <div>
                    <strong>Destino:</strong>
                    ${grupo.destino}
                </div>
                <div>
                    <strong>Líneas:</strong>
                    ${grupo.items.length}
                </div>
                <div>
                    <strong>Bultos:</strong>
                    ${grupo.items.reduce((t,item)=>t+item.bultos, 0)}
                </div>
            </div>

            <div class="signature">
                <div class="signatureTitle">
                    Realizado por:
                </div>
                <div class="signatureSpace"></div>
            </div>

            <div class="signature">
                <div class="signatureTitle">
                    Revisado por:
                </div>
                <div class="signatureSpace"></div>
            </div>
        </div>
    `;
}