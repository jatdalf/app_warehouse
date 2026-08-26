import type { Zsappr110Item } from "../components/Renault/RenaultInformes/inventarios/Zsappr110Item";

export class Zsappr110Reader {
    static async read(): Promise<Zsappr110Item[]> {
        const response = await fetch("/api/drive-file",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({fileId: "1Izb8KmaJ-GNx4sxZaLImZeD-2Ie4nYYB"})
            }
        );
        if (!response.ok) {
            throw new Error("No fue posible cargar ZSAPPR110.dat desde Google Drive.");
        }
        const data = await response.json();
        if (!data.success || !data.base64) {
            throw new Error(data.error ?? "Respuesta inválida al cargar ZSAPPR110.dat.");
        }
        /* Convertimos Base64 -> bytes */
        const binary = atob(data.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        /* IMPORTANTE: el archivo viene en Windows-1252. */
        const text = new TextDecoder("windows-1252").decode(bytes);
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        /* Primera fila = encabezado */
        return lines.slice(1).map((line, index) => {
            const c = line.split(";");
            return {
                id: index + 1,
                documento: c[0]?.trim() ?? "",
                item: c[1]?.trim() ?? "",
                posicion: c[2]?.trim() ?? "",
                material: c[3]?.trim() ?? "",
                descripcion: c[4]?.trim() ?? "",
                stockCantidad: this.parseNumber(c[5]),
                stockValor: this.parseNumber(c[6]),
                version: c[7]?.trim() ?? "",
                ultimoRecuentoCantidad: this.parseNumber(c[8]),
                ultimoRecuentoValor: this.parseNumber(c[9]),
                diferenciaCantidad: this.parseNumber(c[10]),
                diferenciaPorcentaje: this.parseNumber(c[11]),
                diferenciaValor: this.parseNumber(c[12]),
                diferenciaValorAbsoluto: this.parseNumber(c[13])
            };
        });
    }
    /* Formato SAP / argentino:
     * 1.685.672,20
     * -60.660,75
     * 146,00 */
    private static parseNumber(value: string | undefined): number {
        if (!value) {
            return 0;
        }
        let text = value.trim();
        /* En el archivo SAP el negativo puede venir separado:
         * "-             1,00"                              */
        text = text.replace(/\s+/g, "");
        text = text.replace(/\./g, "").replace(",", ".");
        const result = Number(text);
        return Number.isNaN(result) ? 0 : result;
    }
}