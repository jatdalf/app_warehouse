import * as XLSX from "xlsx";

export interface Lx22InventarioItem {
    documento: string;
    statusInventario: string;
    fecha: Date;
    referencia: string;
}

export class Lx22Reader {
    static async read(): Promise<Lx22InventarioItem[]> {
        const response = await fetch("1z-LQgyVkeq68MvpY9yYY4CmwgTRgspmY");
        if (!response.ok) {
            throw new Error("No fue posible cargar lx22.xlsx");
        }
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, {type: "array", cellDates: true});
        const sheet = workbook.Sheets["Sheet1"];

        if (!sheet) {
            throw new Error('No existe la hoja "Sheet1" en lx22.xlsx');
        }

        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {header: 1, raw: true});
        /* Encabezado real en fila 3.
         * Datos desde fila 4. */
        return rows.slice(3).filter(row => row[0] && row[7]).map(row => {
            const referenciaRaw = String(row[4] ?? "").trim().toUpperCase();
            return {documento: this.normalizarDocumento(row[0]),
                fecha: this.parseDate(row[7]),
                statusInventario: String(row[1] ?? "").trim().toUpperCase(),
                /* Sin referencia = CICLICOS */
                referencia: referenciaRaw || "CICLICOS"
            };
        }).filter(item => !Number.isNaN(item.fecha.getTime()));
    }

    static normalizarDocumento(value: unknown): string {
        const texto = String(value ?? "").trim();
        /* 0000049287 -> 49287 */
        return texto.replace(/^0+/, "");
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
        const fecha = new Date(String(value ?? ""));
        return fecha;
    }
}