import * as XLSX from "xlsx";

export class PeYaLocationsReader {
    static async read(fileId: string): Promise<string[]> {
        const response = await fetch(
            "/api/drive-file",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fileId
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                "No fue posible cargar el informe de ubicaciones."
            );
        }

        const data = await response.json();

        if (!data.success || !data.base64) {
            throw new Error(
                data.error ??
                "Respuesta inválida al cargar las ubicaciones."
            );
        }

        const binary = atob(data.base64);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const workbook = XLSX.read(
            bytes,
            {
                type: "array",
                cellDates: true
            }
        );

        const sheet =
            workbook.Sheets["Results"];

        if (!sheet) {
            throw new Error(
                'No existe la hoja "Results".'
            );
        }

        const rows =
            XLSX.utils.sheet_to_json<unknown[]>(
                sheet,
                {
                    header: 1,
                    defval: ""
                }
            );

        /*
         * Fila 20 de Excel = índice 19.
         * Columna B = índice 1.
         */
        const ubicaciones = rows
            .slice(19)
            .map(row =>
                String(row[1] ?? "")
                    .trim()
                    .toUpperCase()
            )
            .filter(ubicacion =>
                ubicacion !== ""
            );

        /*
         * Eliminamos duplicados.
         */
        return [
            ...new Set(ubicaciones)
        ];
    }
}