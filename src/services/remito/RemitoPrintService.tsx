import { createRoot } from "react-dom/client";
import type { Remito } from "../../core/remitos/Remito";
import RemitoDocument from "./RemitoDocument";

export class RemitoPrintService {
    static imprimir(
        remitos: Remito[]
    ): void {
        const ventana = window.open(
            "",
            "_blank",
            "width=900,height=800"
        );
        if (!ventana) {
            throw new Error(
                "No fue posible abrir la ventana de impresión."
            );
        }
        ventana.document.write(`
            <!DOCTYPE html>
            <html lang="es">
                <head>
                    <meta charset="utf-8"/>
                    <title>Remitos</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap"
                        rel="stylesheet">
                </head>

                <body>
                    <div id="root"></div>
                </body>
            </html>
        `);
        ventana.document.close();
        const container =
            ventana.document.getElementById("root");
        if (!container) {
            throw new Error(
                "No fue posible crear el contenedor."
            );
        }
        const root = createRoot(container);
        root.render(
            <RemitoDocument
                remitos={remitos}
            />
        );
        setTimeout(() => {
            ventana.focus();
            ventana.print();
        }, 400);
    }
}