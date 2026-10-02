import * as XLSX from "xlsx";
import type { WarehouseInventario } from "../../InventarioWarehouseConfig";
import type { MetodoPlanificacion } from "../components/PlanificacionMethodSelector";
import type { PlanificacionUbicacion } from "../../hooks/usePlanificacionUbicaciones";


interface ExportarPlanificacionParams {
    warehouse: WarehouseInventario;
    fecha: string;
    metodo: MetodoPlanificacion;
    target: number;
    ubicaciones: PlanificacionUbicacion[];
    ubicacionesSeleccionadas: Set<string>;
}

interface ResumenStorage {
    storage: string;
    llenas: number;
    vacias: number;
    total: number;
}

export class InventarioPlanificacionExcelService {

    static exportar({
        warehouse,
        fecha,
        metodo,
        target,
        ubicaciones,
        ubicacionesSeleccionadas
    }: ExportarPlanificacionParams): void {

        const seleccionadas = ubicaciones.filter(
            item =>
                ubicacionesSeleccionadas.has(item.key)
        );

        if (seleccionadas.length === 0) {
            throw new Error(
                "No hay ubicaciones planificadas para exportar."
            );
        }

        const esVacia = (
            materiales: string[]
        ): boolean => {
            if (materiales.length === 0) {
                return true;
            }

            return materiales.every(
                material =>
                    material
                        .trim()
                        .toLowerCase() ===
                    "<< vacías >>"
            );
        };

        let llenas = 0;
        let vacias = 0;

        const mapaStorage =
            new Map<string, ResumenStorage>();

        seleccionadas.forEach(item => {
            const vacia =
                esVacia(item.materiales);

            if (vacia) {
                vacias++;
            } else {
                llenas++;
            }

            const actual =
                mapaStorage.get(item.storage) ?? {
                    storage: item.storage,
                    llenas: 0,
                    vacias: 0,
                    total: 0
                };

            if (vacia) {
                actual.vacias++;
            } else {
                actual.llenas++;
            }

            actual.total++;

            mapaStorage.set(
                item.storage,
                actual
            );
        });

        const storages =
            [...mapaStorage.values()].sort(
                (a, b) =>
                    a.storage.localeCompare(
                        b.storage,
                        undefined,
                        { numeric: true }
                    )
            );

        const total =
            seleccionadas.length;

        const cumplimiento =
            target > 0
                ? (total / target) * 100
                : 0;

        const fechaFormateada =
            this.formatearFecha(fecha);

        /*
         * HOJA 1: RESUMEN
         */

        const resumenRows = [
            ["PLANIFICACIÓN DE INVENTARIOS"],
            [],
            ["Warehouse", warehouse],
            ["Fecha", fechaFormateada],
            [
                "Tipo de planificación",
                metodo === "UBICACION"
                    ? "Por ubicación"
                    : "Por material"
            ],
            ["Target diario", target],
            ["Total planificado", total],
            ["Cumplimiento", cumplimiento / 100],
            ["Ubicaciones llenas", llenas],
            ["Ubicaciones vacías", vacias],
            ["Storages involucrados", storages.length],
            [],
            [
                "Storage",
                "Llenas",
                "Vacías",
                "Total"
            ],
            ...storages.map(item => [
                item.storage,
                item.llenas,
                item.vacias,
                item.total
            ]),
            [],
            [
                "TOTAL",
                llenas,
                vacias,
                total
            ]
        ];

        const resumenSheet =
            XLSX.utils.aoa_to_sheet(
                resumenRows
            );

        resumenSheet["!cols"] = [
            { wch: 25 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 }
        ];

        // Formato porcentaje.
        const celdaCumplimiento =
            resumenSheet["B8"];

        if (celdaCumplimiento) {
            celdaCumplimiento.z = "0.0%";
        }

        /*
         * HOJA 2: DETALLE
         */

        const detalleRows =
            seleccionadas.map(
                (item, index) => {
                    const vacia =
                        esVacia(item.materiales);

                    return {
                        "N°": index + 1,
                        "Storage": item.storage,
                        "Ubicación": item.ubicacion,
                        "Material":
                            item.materiales.length > 0
                                ? item.materiales.join(", ")
                                : "",
                        "Estado":
                            vacia
                                ? "Vacía"
                                : "Llena"
                    };
                }
            );

        const detalleSheet =
            XLSX.utils.json_to_sheet(
                detalleRows
            );

        detalleSheet["!cols"] = [
            { wch: 8 },
            { wch: 12 },
            { wch: 22 },
            { wch: 35 },
            { wch: 12 }
        ];

        /*
         * WORKBOOK
         */

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            resumenSheet,
            "Resumen"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            detalleSheet,
            "Detalle"
        );

        const nombreArchivo =
            `Planificacion_Inventarios_${warehouse}_${fechaFormateada.replaceAll("/", "-")}.xlsx`;

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

        return `${day}/${month}/${year}`;
    }
}