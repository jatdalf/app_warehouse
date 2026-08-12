import * as XLSX from "xlsx";
import type { IngresoItem } from "../components/PeYa/PeYaInformes/ingresos/IngresoItem";

export class PeYaIngresosReader {
    static async read(): Promise<IngresoItem[]> {
        const response = await fetch("/data/PeYaIngresos.xlsx");
        if (!response.ok) {
            throw new Error("No fue posible cargar PeYaIngresos.xlsx");
        }
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { cellDates: true});
        const sheet = workbook.Sheets["Detail"];
        if (!sheet) {
            throw new Error('No existe la hoja "Detail" en PeYaIngresos.xlsx');
        }
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet,{header: 1, raw: true});

        return rows.slice(2).map(row => {
                // D
                const sku = String(row[3] ?? "").trim();
                // H
                const qtyReceived = this.parseCantidad(row[7]);
                // L
                const toLoc = String(row[11] ?? "").trim();
                // AH
                const dateReceived = this.parseDate(row[33]);

                return {
                    sku,
                    qtyReceived,
                    toLoc,
                    dateReceived
                };
            })

            .filter(item => item.sku !== ""
);
    }


    private static parseCantidad(value: unknown): number {
        if (typeof value === "number") {
            return Math.trunc(value);
        }
        const texto = String(value ?? "").trim();
        if (!texto) {
            return 0;
        }
        const numero = Number(texto.replace(",", "."));
        if (Number.isNaN(numero)) {
            return 0;
        }
        return Math.trunc(numero);
    }


    private static parseDate(
        value: unknown
    ): Date {
        // Si XLSX ya lo convirtió a Date
        if (value instanceof Date) {
            return value;
        }
        // Si Excel entrega un serial
        if (typeof value === "number") {

            const parsed = XLSX.SSF.parse_date_code(value);

            if (!parsed) {
                return new Date(NaN);
            }

            return new Date(
                parsed.y,
                parsed.m - 1,
                parsed.d,
                parsed.H ?? 0,
                parsed.M ?? 0,
                parsed.S ?? 0
            );
        }

        // Ejemplo:
        // 20/6/26 13:44

        const texto = String(value ?? "").trim();

        if (!texto) {
            return new Date(NaN);
        }

        const [fecha, hora = "00:00"] = texto.split(/\s+/);
        const partesFecha = fecha.split("/");

        if (partesFecha.length !== 3) {
            return new Date(NaN);
        }

        const dia = Number(partesFecha[0]);
        const mes = Number(partesFecha[1]);
        let anio = Number(partesFecha[2]);
        // 26 → 2026
        if (anio < 100) {
            anio += 2000;
        }

        const partesHora = hora.split(":");
        const horas = Number(partesHora[0] ?? 0);
        const minutos = Number(partesHora[1] ?? 0);

        return new Date(
            anio,
            mes - 1,
            dia,
            horas,
            minutos
        );
    }
}