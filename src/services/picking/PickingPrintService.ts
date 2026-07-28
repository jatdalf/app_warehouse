import type { PickingItem } from "../../core/picking/PickingItem";
import { buildPickingHtml } from "./PickingHtmlBuilder";

export class PickingPrintService {
    static imprimir(
        picking: PickingItem[]
    ) {
        const ventana = window.open(
            "",
            "_blank",
            "width=900,height=800"
        );
        if (!ventana) {
            throw new Error("No fue posible abrir la ventana de impresión.");
        }
        ventana.document.open();
        ventana.document.write(
            buildPickingHtml(picking)
        );
        ventana.document.close();
        ventana.focus();
        ventana.onload = () => {
            ventana.print();
        };
    }
}