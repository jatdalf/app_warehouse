import * as XLSX from "xlsx";
import type { InventarioItem } from "../components/PeYa/PeYaInformes/inventarios/InventarioItem";

export class PeYaInventariosReader {
    static async read(): Promise<InventarioItem[]> {
        const response = await fetch("/data/PeYaInventarios.xlsx");
        if (!response.ok) {
            throw new Error("No fue posible cargar PeYaInventarios.xlsx");
        }
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets["Sheet1"];
        if (!sheet) {
            throw new Error('No existe la hoja "Sheet1" en PeYaInventarios.xlsx');
        }
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet,{header: 1, raw: true});

        return rows.slice(1).map(row => ({
            propietario: String(row[0] ?? "").trim(),
            articulo: String(row[1] ?? "").trim(),
            ubicacion: String(row[2] ?? "").trim(),
            fecha: this.parseDate(row[3]),
            usuario: String(row[4] ?? "").trim(),
            estatus: String(row[5] ?? "").trim(),
            resultado: String(row[6] ?? "").trim(),
            numeroTarea: String(row[7] ?? "").trim()
        }))

        // Solamente inventarios reales contabilizados
        .filter(item => !Number.isNaN(item.fecha.getTime()) && item.estatus.toLowerCase() === "contabilizado"
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
            return new Date(
                parsed.y,
                parsed.m - 1,
                parsed.d,
                parsed.H ?? 0,
                parsed.M ?? 0
            );
        }
        /*
         * Formato observado:
         *
         * 2/7/26, 11:25
         */
        const texto = String(value ?? "").trim();
        if (!texto) {
            return new Date(NaN);
        }

        const partes = texto.split(",");
        const fechaTexto = partes[0]?.trim();
        const horaTexto = partes[1]?.trim() ?? "00:00";
        const fechaPartes = fechaTexto.split("/");
        if (fechaPartes.length !== 3) {
            return new Date(NaN);
        }
        const dia = Number(fechaPartes[0]);
        const mes = Number(fechaPartes[1]);
        let anio = Number(fechaPartes[2]);
        if (anio < 100) {
            anio += 2000;
        }
        const horaPartes = horaTexto.split(":");
        return new Date(anio, mes - 1, dia, Number(horaPartes[0] ?? 0), Number(horaPartes[1] ?? 0));
    }
}