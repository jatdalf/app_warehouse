import { formatPrintDate } from "../../core/shared/DateFormatter";
import logo from "../../assets/PeYa.png";

export function buildPickingHeader(pedido: string, destino: string, lineas: number) {
    const fecha = formatPrintDate().split(" ");
    return `
        <div class="header">
            <div class="headerTop">
                <div class="logoBox">
                    <img
                        class="logoPeYa"
                        src="${logo}"
                        alt="Logo"
                    />
                </div>
                <div class="titleBox">
                    HOJA DE PICKING
                </div>
                <div class="dateBox">
                    <div>${fecha[0]}</div>
                    <div>${fecha[1]}</div>
                </div>
            </div>
            <div class="separator"></div>
            <div class="headerInfo">
                <div>
                    <span class="label">
                        Pedido:
                    </span>
                    <span class="value">
                        ${pedido}
                    </span>
                </div>
                <div>
                    <span class="label">
                        Destino:
                    </span>
                    <span class="value">
                        ${destino}
                    </span>
                </div>
                <div>
                    <span class="label">
                        Líneas:
                    </span>
                    <span class="value">
                        ${lineas}
                    </span>
                </div>
            </div>
            <div class="separator"></div>
        </div>
    `;
}