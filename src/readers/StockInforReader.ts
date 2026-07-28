import * as XLSX from "xlsx";
import type { StockItem } from "../core/stock/StockItem";

export class StockInforReader {
    static async read(file: File): Promise<StockItem[]> {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[
            workbook.SheetNames[0]
        ];

        const rows = XLSX.utils.sheet_to_json<any[]>(sheet,{
            header:1
        });

        return rows
            .slice(1)
            .filter(r => r[1] && r[4])
            .map(r => ({
                articulo: String(r[1]).trim(),
                ubicacion: String(r[4]).trim(),
                stock: Number(String(r[7] ?? "0").replace(",", "."))
            }))
            .filter(r => r.stock > 0);
    }
}