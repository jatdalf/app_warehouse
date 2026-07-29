import type { StockItem } from "./StockItem";
import type { PickingItem } from "../picking/PickingItem";
import type { DistributionResult } from "../picking/DistributionResult";
import type { OrderItem } from "../orders/OrderItem";
import type { PickingProcessResult } from "../picking/PickingProcessResult";
import type { StockShortage } from "./StockShortage";
import type { PickingStats } from "../picking/PickingStats";
import { StockIndex } from "./StockIndex";

export class StockAllocator {

    distribuirCantidad(
        ubicaciones: StockItem[],
        pedido: OrderItem
    ): DistributionResult {
        const items: PickingItem[] = [];
        let pendiente = pedido.bultos;
        for (const ubicacion of ubicaciones) {
            if (pendiente <= 0) {
                break;
            }
            const tomar = Math.min(
                pendiente,
                ubicacion.stock
            );
            if (tomar <= 0) {
                continue;
            }
            ubicacion.stock -= tomar;
            items.push({
                st: pedido.st,
                sku: pedido.sku,
                descripcion: pedido.title,   
                bultos: tomar,
                destino: pedido.storeName,
                ubicacion: ubicacion.ubicacion
            });
            pendiente -= tomar;
        }
        return {
            items,
            pendiente
        };
    }

    allocate(
        pedidos: OrderItem[],
        stock: StockItem[]
    ): PickingProcessResult {
        const stockIndex = new StockIndex(stock);
        const picking: PickingItem[] = [];
        const shortages: StockShortage[] = [];
        const stats: PickingStats = {
            pedidos: new Set(pedidos.map(p => p.st)).size,
            lineas: 0,
            skuProcesados: 0,
            bultosSolicitados: 0,
            bultosAsignados: 0,
            faltantes: 0
        };
        for (const pedido of pedidos) {
            const ubicaciones = stockIndex.obtenerUbicaciones(pedido.sku);
            const resultado = this.distribuirCantidad(ubicaciones, pedido);
            picking.push(...resultado.items);
            if (resultado.pendiente > 0) {
                shortages.push({
                    st: pedido.st,
                    sku: pedido.sku,
                    descripcion: pedido.title,
                    solicitado: pedido.bultos,
                    asignado: pedido.bultos - resultado.pendiente,
                    faltante: resultado.pendiente
                });
            }
            stats.bultosSolicitados += pedido.bultos;
            stats.bultosAsignados += pedido.bultos - resultado.pendiente;
        }
        stats.lineas = picking.length;
        stats.skuProcesados = pedidos.length;
        stats.faltantes = shortages.length;
        return {
            picking,
            stockActualizado: stockIndex.getStock(),
            shortages,
            stats
        };
    }
}

   

