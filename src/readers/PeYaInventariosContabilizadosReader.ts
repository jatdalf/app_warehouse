import * as XLSX from "xlsx";

export interface PeYaInventarioContabilizadoItem {
    fecha: Date;
    ubicacion: string;
    estatus: string;
    motivo: string;
    conDiferencia: boolean;
}

export interface PeYaInventariosContabilizadosData {
    items: PeYaInventarioContabilizadoItem[];
    createdAt: Date | null;
}

export class PeYaInventariosContabilizadosReader {

    static async read(
        fileId: string
    ): Promise<PeYaInventariosContabilizadosData> {

        const response = await fetch("/api/drive-file", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fileId })
        });

        if (!response.ok) {
            throw new Error(
                "No fue posible cargar el informe de inventarios contabilizados."
            );
        }

        const data = await response.json();

        if (!data.success || !data.base64) {
            throw new Error(
                data.error ??
                "Respuesta inválida al cargar el informe de inventarios contabilizados."
            );
        }

        const binary = atob(data.base64);

        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const workbook = XLSX.read(bytes, {
            type: "array",
            cellDates: true,
        });

        const sheet =
            workbook.Sheets[workbook.SheetNames[0]];

        if (!sheet) {
            throw new Error(
                "El informe de inventarios contabilizados no contiene hojas."
            );
        }

        /*
         * IMPORTANTE:
         * No usamos números de columna.
         * SheetJS utiliza los nombres de los encabezados
         * como propiedades del objeto.
         */
        const rows =
            XLSX.utils.sheet_to_json<Record<string, unknown>>(
                sheet,
                {
                    defval: "",
                    raw: true
                }
            );

        const rawModified =
            workbook.Props?.ModifiedDate;

        const createdAt =
            rawModified
                ? new Date(rawModified)
                : null;

        const items: PeYaInventarioContabilizadoItem[] = [];

        for (const row of rows) {

            const ubicacion =
                String(row["Ubicación"] ?? "")
                    .trim()
                    .toUpperCase();

            const estatus =
                String(row["Estatus"] ?? "")
                    .trim();

            const motivo =
                String(
                    row["Motivo ajuste inventario rotativo"] ?? ""
                ).trim();

            const fecha =
                this.parseFecha(
                    row["Fecha de recuento"]
                );

            /*
             * Solo consideramos inventarios realmente
             * contabilizados.
             */
            if (
                !ubicacion ||
                !fecha ||
                estatus.toUpperCase() !== "CONTABILIZADO"
            ) {
                continue;
            }

            items.push({
                fecha,
                ubicacion,
                estatus,
                motivo,

                conDiferencia:
                    motivo.toUpperCase() !==
                    "RECUENTO IGUAL IR POR RF"
            });
        }

        return {
            items,
            createdAt
        };
    }

    private static parseFecha(
        value: unknown
    ): Date | null {

        if (value instanceof Date) {
            /*
             * Quitamos explícitamente la hora.
             */
            return new Date(
                value.getFullYear(),
                value.getMonth(),
                value.getDate()
            );
        }

        if (typeof value === "number") {
            const parsed =
                XLSX.SSF.parse_date_code(value);

            if (!parsed) {
                return null;
            }

            return new Date(
                parsed.y,
                parsed.m - 1,
                parsed.d
            );
        }

        if (typeof value !== "string") {
            return null;
        }

        const texto = value.trim();

        /*
         * Admite, por ejemplo:
         *
         * 2/9/26
         * 2/9/26, 09:49
         * 02/09/2026
         * 02/09/2026 09:49
         */
        const match = texto.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/
        );

        if (!match) {
            return null;
        }

        const dia = Number(match[1]);
        const mes = Number(match[2]) - 1;

        let anio = Number(match[3]);

        if (anio < 100) {
            anio += 2000;
        }

        return new Date(
            anio,
            mes,
            dia
        );
    }
}