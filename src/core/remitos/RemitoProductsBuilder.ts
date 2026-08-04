import type { PickingItem } from "../picking/PickingItem";
import type { Producto } from "./Producto";

export class RemitoProductsBuilder {
    static build(picking: PickingItem[]): Producto[] {

        const productos = new Map<string, Producto>();

        for (const item of picking) {
            const key = this.getKey(item);
            const existente = productos.get(key);
            if (existente) {
                existente.bultos += item.bultos;
                existente.unidades += item.bultos;
                continue;
            }

            productos.set(key, {
                sku: item.sku,
                ean: "",
                descripcion: item.descripcion,
                uxb: 1,
                bultos: item.bultos,
                unidades: item.bultos
            });
        }

        return [...productos.values()];
    }

    /**
     * Devuelve la clave utilizada para consolidar
     * productos dentro del remito.
     *
     * Hoy:
     *     SKU
     *
     * Mañana podría ser:
     *     SKU + Lote
     *     SKU + Vencimiento
     *     EAN
     *     etc.
     */
    private static getKey(item: PickingItem): string {
        return item.sku;
    }
}