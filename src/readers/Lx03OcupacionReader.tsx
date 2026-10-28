import * as XLSX from "xlsx";
import type { Lx03OcupacionItem } from "../components/Renault/RenaultInformes/ocupacion/Lx03OcupacionItem";

export class Lx03OcupacionReader {
    private static parseNumber(value: unknown): number {
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : 0;
        }

        const text = String(value ?? "").trim();

        if (!text) {
            return 0;
        }

        const normalized = text
            .replace(/\s+/g, "")
            .replace(/\./g, "")
            .replace(",", ".");

        const numero = Number(normalized);

        return Number.isFinite(numero) ? numero : 0;
    }

    static async read(fileId: string): Promise<Lx03OcupacionItem[]> {
        const response = await fetch("/api/drive-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
        });

        if (!response.ok) {
            throw new Error("No fue posible descargar LX03.");
        }

        const data = await response.json();

        if (!data.success || !data.base64) {
            throw new Error("Respuesta inválida al descargar LX03.");
        }

        const binary = atob(data.base64);
        const bytes = Uint8Array.from(
            binary,
            character => character.charCodeAt(0),
        );

        return this.parse(bytes);
    }

    static async readFile(file: File): Promise<Lx03OcupacionItem[]> {
        const buffer = await file.arrayBuffer();

        return this.parse(new Uint8Array(buffer));
    }

    private static parse(bytes: Uint8Array): Lx03OcupacionItem[] {
        const workbook = XLSX.read(bytes, {
            type: "array",
            cellDates: true,
        });

        const sheet = workbook.Sheets["Sheet1"];

        if (!sheet) {
            throw new Error("No se encontró la hoja Sheet1 en LX03.");
        }

        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
            defval: "",
        });

        const items = rows
            .slice(1)
            .map((row): Lx03OcupacionItem => ({
                storage: String(row[0] ?? "").trim(),
                ubicacion: String(row[1] ?? "").trim(),
                material: String(row[3] ?? "").trim(),
                cantidad: this.parseNumber(row[4]),
            }))
            .filter(item => item.storage !== "" && item.ubicacion !== "");

        if (items.length === 0) {
            throw new Error(
                "La LX03 no contiene ubicaciones válidas. Revisá la hoja Sheet1 y sus columnas.",
            );
        }

        return items;
    }
}