import type { LinvVaciaItem } from "../../../../../readers/LinvReader";
import type { Lx22InventarioItem } from "../../../../../readers/Lx22Reader";
import type { InventarioSapLinea } from "../InventarioSapLinea";

export interface LinvInventarioItem {
    documento: string;
    ubicacion: string;
    tipoAlmacen: string;
    fecha: Date;
    referencia: string;
    statusInventario: string;
}

export class LinvInventarioBuilder {
    static build(vacias: LinvVaciaItem[], documentos: Lx22InventarioItem[]): LinvInventarioItem[] {
        const documentosMap = new Map(documentos.map(item => 
            [this.normalizarDocumento(item.documento), item]));
        return vacias
            .map(vacia => {
                const documento = this.normalizarDocumento(vacia.documento);
                const metadata = documentosMap.get(documento);
                // LINV tiene la ubicación,
                // pero no encontramos su documento en LX22.
                if (!metadata) {
                    return null;
                }
                // Para actividad realizada solamente
                // consideramos documentos cerrados.
                if (metadata.statusInventario.trim().toUpperCase() !== "ELIMINADOS") {
                    return null;
                }
                return {
                    documento,
                    ubicacion: vacia.ubicacion,
                    tipoAlmacen: vacia.tipoAlmacen,
                    fecha: metadata.fecha,
                    referencia: metadata.referencia || "CICLICOS",
                    statusInventario: metadata.statusInventario
                };
            }).filter((item): item is LinvInventarioItem => item !== null
        );
    }

    static buildLineas(
        vacias: LinvVaciaItem[],
        documentos: Lx22InventarioItem[]
    ): InventarioSapLinea[] {
        const validadas = this.build(vacias, documentos);
        return validadas.map((item, index) => ({
                /*
                * IDs negativos para evitar colisiones
                * con los IDs provenientes de ZSAPPR110.
                */
                id: -(index + 1),
                documento: item.documento,
                statusInventario: item.statusInventario,
                fecha: item.fecha,
                referencia: item.referencia,
                posicion: item.ubicacion,
                /*
                * LINV_VACIA no tiene material,
                * descripción, stock ni diferencias.
                */
                material: "",
                descripcion: "UBICACIÓN VACÍA",
                stockCantidad: 0,
                stockValor: 0,
                diferenciaCantidad: 0,
                diferenciaValor: 0,
                diferenciaValorAbsoluto: 0,
                origen: "LINV_VACIA" as const
            })
        );
    }


    private static normalizarDocumento(value: string): string {
        return String(value).trim().replace(/^0+/, "");
    }
}