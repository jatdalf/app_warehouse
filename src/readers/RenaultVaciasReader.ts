import * as XLSX from "xlsx";
import type { VaciasItem } from "../components/Renault/RenaultInformes/inventarios/vacias/VaciasItem";

export class RenaultVaciasReader {
    static async read(fileId: string): Promise<VaciasItem[]> {
        const response = await fetch("/api/drive-file",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({fileId})
            }
        );
        if (!response.ok) {
            throw new Error("No fue posible cargar el relevamiento de ubicaciones vacías.");
        }
        const result = await response.json();
        const binary = atob(result.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const workbook = XLSX.read(bytes, {type: "array", cellDates: true});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {header: 1, defval: ""});

        return rows.slice(1).map(row => ({
            fecha: row[0] instanceof Date ? row[0] : new Date(row[0]),
            relevadas: Number(row[1]) || 0,
            ocupado: Number(row[2]) || 0
        })).filter(item => !Number.isNaN(item.fecha.getTime()));
    }
}