import * as XLSX from "xlsx";

export interface CompactacionItem {
    fecha: Date;
    trabajadas: number;
    liberadas: number;
}

export interface MapaCalorItem {
    fecha: Date;
    bajadas: number;
    subidas: number;
}

export interface ReingenieriaData {
    compactacion: CompactacionItem[];
    mapaCalor: MapaCalorItem[];
}

export class RenaultReingenieriaReader {
    static async read(fileId: string): Promise<ReingenieriaData> {
        const response = await fetch("/api/drive-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
        });

        if (!response.ok) {
            throw new Error("No fue posible cargar Reingeniería.");
        }

        const result = await response.json();

        if (!result.success || !result.base64) {
            throw new Error(
                result.error ?? "Respuesta inválida al cargar Reingeniería.",
            );
        }

        const binary = atob(result.base64);
        const bytes = Uint8Array.from(
            binary,
            character => character.charCodeAt(0),
        );

        const workbook = XLSX.read(bytes, {
            type: "array",
            cellDates: true,
        });

        const leerHoja = (nombre: string): unknown[][] => {
            const nombreReal = workbook.SheetNames.find(
                item => this.normalizar(item) === this.normalizar(nombre),
            );

            if (!nombreReal) {
                return [];
            }

            return XLSX.utils.sheet_to_json<unknown[]>(
                workbook.Sheets[nombreReal],
                { header: 1, defval: "", raw: true },
            ).slice(1);
        };

        const compactacion = leerHoja("compactacion")
            .map(row => ({
                fecha: this.parseDate(row[0]),
                trabajadas: this.parseNumber(row[1]),
                liberadas: this.parseNumber(row[2]),
            }))
            .filter(item => !Number.isNaN(item.fecha.getTime()));

        const mapaCalor = leerHoja("Mapa de calor")
            .map(row => ({
                fecha: this.parseDate(row[0]),
                bajadas: this.parseNumber(row[1]),
                subidas: this.parseNumber(row[2]),
            }))
            .filter(item => !Number.isNaN(item.fecha.getTime()));

        return { compactacion, mapaCalor };
    }

    private static normalizar(value: string): string {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase();
    }

    private static parseNumber(value: unknown): number {
        const numero = Number(value);
        return Number.isFinite(numero) ? numero : 0;
    }

    private static parseDate(value: unknown): Date {
        if (value instanceof Date) {
            return new Date(
                value.getFullYear(),
                value.getMonth(),
                value.getDate(),
            );
        }

        if (typeof value === "number") {
            const parsed = XLSX.SSF.parse_date_code(value);

            return parsed
                ? new Date(parsed.y, parsed.m - 1, parsed.d)
                : new Date(NaN);
        }

        const texto = String(value ?? "").trim();
        const partes = texto.match(
            /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
        );

        if (partes) {
            const [, dia, mes, anio] = partes;
            return new Date(Number(anio), Number(mes) - 1, Number(dia));
        }

        return texto ? new Date(texto) : new Date(NaN);
    }
}