import * as XLSX from "xlsx";
import type { StockItem } from "../core/stock/StockItem";

export class StockInforReader {
    static async read(file: File): Promise<StockItem[]> {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, {
            cellDates: true
        });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {header: 1, raw: true});

        return rows.slice(1).filter(r => r[1] && r[4]).map(r => ({
                articulo: String(r[1]).trim(),
                ubicacion: String(r[4]).trim(),
                stock: Number(String(r[7] ?? "0").replace(",", ".")),
                // Columna X
                fechaVencimiento: this.parseFechaVencimiento(r[23])
        })).filter(r => r.stock > 0);
    }

    private static parseFechaVencimiento(value: unknown): Date | null {
        // XLSX ya la convirtió
        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : value;
        }
        // Fecha serial de Excel
        if (typeof value === "number") {
            const parsed = XLSX.SSF.parse_date_code(value);
            if (!parsed) {
                return null;
            }
            return new Date(parsed.y, parsed.m - 1, parsed.d);
        }
        // Fecha como texto
        if (typeof value === "string") {
            const texto = value.trim();
            if (!texto) {
                return null;
            }
            /* Formatos: 18/09/2026 18/9/26 */
            const match = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);

            if (match) {
                const dia = Number(match[1]);
                const mes = Number(match[2]) - 1;
                let anio = Number(match[3]);
                if (anio < 100) {
                    anio += 2000;
                }

                return new Date(anio, mes, dia);
            }
        }
        return null;
    }
}