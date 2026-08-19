import * as XLSX from "xlsx";
import type { InventarioItem } from "../components/PeYa/PeYaInformes/inventarios/InventarioItem";

export interface PeYaInventariosData {
    items: InventarioItem[];
    createdAt: Date | null;
}

export class PeYaInventariosReader {
    static async read(): Promise<PeYaInventariosData> {
        const response = await fetch("/api/drive-file",
            {method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify({fileId: "1gWp_GbSmR3T5gbziVUtiF9aXFyb9-Dmh"})
            }
        );
        if (!response.ok) {throw new Error("No fue posible cargar el informe de inventarios.");}
        const data = await response.json();
        if (!data.success || !data.base64) {
            throw new Error(data.error ?? "Respuesta inválida al cargar el informe de inventarios.");
        }
        const binary = atob(data.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const workbook = XLSX.read(bytes, {type: "array", cellDates: true});
        const sheet = workbook.Sheets["Results"];
        if (!sheet) {throw new Error('No existe la hoja "Results".');}
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet,{header: 1, raw: true});
        const rawModified = workbook.Props?.ModifiedDate;
        const createdAt = rawModified ? new Date(rawModified) : null;
        const items: InventarioItem[] = [];
        let fechaActual: Date | null = null;
        /* Los datos útiles comienzan a partir de la fila 11/12. Podemos recorrer desde índice 10. */
        for (const row of rows.slice(10)) {
            /* Columna A En las filas cabecera contiene: Aug 01, 2026 */
            const columnaA = row[0];
            const posibleFecha = this.parseDateHeader(columnaA);
            /* Si encontramos una fecha, comienza un nuevo bloque. */
            if (posibleFecha) {
                fechaActual = posibleFecha;
                continue;
            }
            const ubicacion = String(row[15] ?? "").trim();
            /* Si no tiene ubicación, NO es una fila de inventario. */
            if (!ubicacion) {
                continue;
            }
            if (!fechaActual) {
                continue;
            }
            const quantityAdjusted = this.parseNumber(row[19]);
            items.push({fecha: new Date(fechaActual), ubicacion, quantityAdjusted});
        }
        return {items, createdAt};
    }

    private static parseNumber(value: unknown): number {
        if (value === null || value === undefined || value === "") {
            return 0;
        }
        if (typeof value === "number") {
            return value;
        }
        const numero = Number(String(value).replace(",", ".").trim());
        return Number.isNaN(numero) ? 0 : numero;
    }

    private static parseDateHeader(value: unknown): Date | null {
        if (value instanceof Date) {
            return value;
        }
        if (typeof value !== "string") {
            return null;
        }
        const match = value.trim().match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/);
        if (!match) {
            return null;
        }
        const meses: Record<string, number> = {Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11};

        const month = meses[match[1]];
        if (month === undefined) {
            return null;
        }
        return new Date(Number(match[3]), month, Number(match[2]));
    }
}