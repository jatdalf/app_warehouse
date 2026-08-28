import * as XLSX from "xlsx";
import type { AlmacenItem } from "../components/Renault/RenaultInformes/ocupacion/AlmacenItem";

export class AlmacenesReader {

    static async read(fileId: string): Promise<AlmacenItem[]> {
        const response = await fetch("/api/drive-file",
            {
                method: "POST",
                headers: {"Content-Type": "application/json" },
                body: JSON.stringify({fileId})
            }
        );

        if (!response.ok) {
            throw new Error("No fue posible descargar el archivo de almacenes.");
        }
        const data = await response.json();
        if (!data.success || !data.base64) {
            throw new Error("Respuesta inválida al descargar almacenes.");
        }
        /* -------------------------
           BASE64 → Uint8Array
        ------------------------- */
        const binary = atob(data.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        /* -------------------------
           LEER EXCEL
        ------------------------- */
        const workbook = XLSX.read(bytes, {type: "array"});
        const sheet = workbook.Sheets["Hoja1"];
        if (!sheet) {
            throw new Error("No se encontró la hoja Hoja1 en almacenes.");
        }
        const rows = XLSX.utils.sheet_to_json<unknown[]>( sheet, {header: 1, defval: ""});
        /* No hay encabezado.
            A [0] = Storage
            B [1] = Descripción */
        return rows.map((row): AlmacenItem => ({
                    storage: String(row[0] ?? "").trim().toUpperCase(),
                    descripcion: String(row[1] ?? "").trim()})).filter(item => item.storage !== "" );
    }
}