import * as XLSX from "xlsx";
import type { FeriadoItem } from "../components/PeYa/PeYaInformes/inventarios/FeriadoItem";

export class PeYaFeriadosReader {
    static async read(): Promise<FeriadoItem[]> {
        const response = await fetch("/data/Feriados2026.xlsx");
        if (!response.ok) {
            throw new Error("No fue posible cargar Feriados2026.xlsx");
        }
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, {cellDates: true});
        const sheet = workbook.Sheets["Hoja1"];

        if (!sheet) {
            throw new Error('No existe la hoja "Hoja1" en Feriados2026.xlsx');
        }

        const rows = XLSX.utils.sheet_to_json<any[]>(sheet,{ header: 1, raw: true});

        return rows.slice(1).map(row => ({
                fecha: this.parseDate(row[0]),
                descripcion: String(row[1] ?? "").trim()
            }))
            .filter(item => !Number.isNaN(item.fecha.getTime()));
    }


    private static parseDate(value: unknown): Date {
        if (value instanceof Date) {
            return value;
        }
        if (typeof value === "number") {
            const parsed = XLSX.SSF.parse_date_code(value);
            if (!parsed) {
                return new Date(NaN);
            }
            return new Date(parsed.y, parsed.m - 1, parsed.d);
        }
        return new Date(String(value ?? ""));
    }
}