import type { Zsappr110Item } from "./Zsappr110Item";
import type { Lx22InventarioItem } from "../../../../readers/Lx22Reader";
import type { InventarioSapLinea } from "./InventarioSapLinea";

export class InventarioSapBuilder {
    static build(lineas: Zsappr110Item[], documentos: Lx22InventarioItem[]): InventarioSapLinea[] {
        const documentosMap = new Map(documentos.map(item => [item.documento, item]));
        return lineas.map(linea => {
            const documento = linea.documento.replace(/^0+/, "");
            const metadata = documentosMap.get(documento);
            if (!metadata) {
                return null;
            }
            return {
                id: linea.id,
                documento,
                fecha: metadata.fecha,
                referencia: metadata.referencia,
                posicion: linea.posicion,
                material: linea.material,
                descripcion: linea.descripcion,
                stockCantidad: linea.stockCantidad,
                stockValor: linea.stockValor,
                diferenciaCantidad: linea.diferenciaCantidad,
                diferenciaValor: linea.diferenciaValor,
                diferenciaValorAbsoluto: linea.diferenciaValorAbsoluto
            };
        }).filter((item): item is InventarioSapLinea => item !== null);
    }
}