import * as XLSX from "xlsx";
import type { OcupacionItem } from "../components/PeYa/PeYaInformes/ocupacion/OcupacionItem";

export class PeYaOcupacionReader {
    static async read(): Promise<OcupacionItem[]> {
    const response = await fetch("/api/drive-file",
    {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({fileId: "1A2G9QqzbjET4zjAeHWHoeO3LEpNtOlIB"})
    });
        if (!response.ok) {
            throw new Error("No fue posible cargar seguimiento PeYa.xlsx");
        }
        const data = await response.json();
        const binary = atob(data.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const workbook = XLSX.read(bytes,{type: "array", cellDates: true});
        const sheet = workbook.Sheets["2026"];
        if (!sheet) {
            throw new Error('No existe la hoja "2026"');
        }
        const rows = XLSX.utils.sheet_to_json<any[]>( sheet,{header: 1, raw: true});

        return rows.slice(1).map(row => {
            const fecha = this.parseDate(row[0]);
            const posiciones = row[1] === null || row[1] === undefined || row[1] === "" ? null : Number(row[1]);
            const sku = row[2] === null || row[2] === undefined || row[2] === "" ? null : Number(row[2]);
            return {
                fecha,
                posiciones,
                sku
            };
        })
            // MUY IMPORTANTE:
            // elimina fechas futuras sin datos
            .filter((item): item is OcupacionItem => !Number.isNaN(item.fecha.getTime()) &&
                    item.posiciones !== null && item.sku !== null &&
                    !Number.isNaN(item.posiciones) && !Number.isNaN(item.sku)
            );
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