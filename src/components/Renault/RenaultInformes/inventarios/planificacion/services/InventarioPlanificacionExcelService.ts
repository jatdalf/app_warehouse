import * as XLSX from "xlsx";

export interface PosicionPlanificadaExcel {
    storage: string;
    ubicacion: string;
    material: string;
}

interface ExportarPlanificacionParams {
    warehouse: "W1" | "W2";
    fecha: string;
    target: number;
    posiciones: PosicionPlanificadaExcel[];
}

export class InventarioPlanificacionExcelService {

    static exportar({
        warehouse,
        fecha,
        target,
        posiciones
    }: ExportarPlanificacionParams) {

        if (posiciones.length === 0) {
            throw new Error(
                "No hay ubicaciones seleccionadas para exportar."
            );
        }

        const warehouseNombre =
            warehouse === "W1"
                ? "W1 (Rep)"
                : "W2 (BsAs)";

        const fechaFormateada =
            this.formatearFecha(fecha);

        const porcentaje =
            target > 0
                ? (posiciones.length / target) * 100
                : 0;

        const filas: (string | number)[][] = [
            ["PLANIFICACIÓN DE INVENTARIOS"],
            [],
            ["Warehouse", warehouseNombre],
            ["Fecha", fechaFormateada],
            ["Target diario", target],
            ["Posiciones planificadas", posiciones.length],
            [
                "Cumplimiento planificación",
                `${porcentaje.toLocaleString("es-AR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                })}%`
            ],
            [],
            [
                "N°",
                "Storage",
                "Ubicación",
                "Material"
            ]
        ];

        posiciones.forEach((posicion, index) => {
            filas.push([
                index + 1,
                posicion.storage,
                posicion.ubicacion,
                posicion.material || "—"
            ]);
        });

        const worksheet =
            XLSX.utils.aoa_to_sheet(filas);

        /*
         * Ancho de columnas
         */
        worksheet["!cols"] = [
            {wch: 7},
            {wch: 14},
            {wch: 24},
            {wch: 45}
        ];

        /*
         * Autofiltro sobre la tabla.
         *
         * La tabla comienza en la fila 9.
         */
        worksheet["!autofilter"] = {
            ref: `A9:D${filas.length}`
        };

        /*
         * Congelar no está soportado de forma uniforme
         * por todas las versiones de SheetJS Community,
         * así que evitamos depender de ello.
         */

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Planificación"
        );

        const fechaArchivo =
            fechaFormateada.replace(/\//g, "-");

        const nombreArchivo =
            `Planificacion_Inventarios_${warehouse}_${fechaArchivo}.xlsx`;

        XLSX.writeFile(
            workbook,
            nombreArchivo
        );
    }

    private static formatearFecha(
        fecha: string
    ): string {

        const [year, month, day] =
            fecha.split("-");

        if (!year || !month || !day) {
            return fecha;
        }

        return `${day}/${month}/${year}`;
    }
}