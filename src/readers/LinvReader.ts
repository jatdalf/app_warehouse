export interface LinvVaciaItem {documento: string; tipoAlmacen: string; ubicacion: string;}

export class LinvReader {
    static async read(fileId: string): Promise<LinvVaciaItem[]> {
        const response = await fetch("/api/drive-file",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ fileId })
            }
        );
        if (!response.ok) {
            throw new Error("No se pudo cargar LINV");
        }
        const result = await response.json();
        if (!result.success || !result.base64) {
            throw new Error("Respuesta inválida al cargar LINV");
        }
        const binary = atob(result.base64);
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        const text = new TextDecoder("utf-8").decode(bytes);
        return this.parse(text);
    }
    private static parse(text: string): LinvVaciaItem[] {
        const lineas = text.split(/\r?\n/).slice(5);
        const resultado: LinvVaciaItem[] = [];
            for (const linea of lineas) {
            if (!linea.trim()) {
                continue;
            }
            const columnas = linea.split("\t");
            const documento = this.normalizarDocumento(columnas[3] ?? "");
            const tipoAlmacen = String(columnas[15] ?? "").trim().toUpperCase();
            const ubicacion = String(columnas[16] ?? "").trim().toUpperCase();
            const material = String(columnas[20] ?? "").trim();
            if (!documento || !ubicacion || material) {
                continue;
            }
            resultado.push({documento, tipoAlmacen, ubicacion});
        }
        return this.eliminarDuplicados(resultado);
    }

    private static normalizarDocumento(value: string): string {
        return String(value).trim().replace(/^0+/, "");
    }

    private static eliminarDuplicados(items: LinvVaciaItem[]): LinvVaciaItem[] {
        const unicos = new Map<string, LinvVaciaItem>();
        for (const item of items) {
            const key = `${item.documento}|${item.ubicacion}`;
            if (!unicos.has(key)) {
                unicos.set(key, item);
            }
        }
        return [...unicos.values()];
    }
    
}