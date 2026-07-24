    import type { StockItem } from "./StockItem";
    import type { PickingItem } from "../picking/PickingItem";
    import type { DistributionResult } from "../picking/DistributionResult.ts";
    import type { OrderItem } from "../orders/OrderItem";
    import type { PickingProcessResult } from "../picking/PickingProcessResult";
    import type { StockShortage } from "./StockShortage";
    import type { PickingStats } from "../picking/PickingStats";


    export class StockAllocator {
        
        buscarUbicacionesPorSKU(
            stock: StockItem[],
            sku: string
        ): StockItem[] {
            return stock
                .filter(item => item.articulo === sku)
                .sort((a, b) =>
                    this.compararUbicaciones(
                        a.ubicacion,
                        b.ubicacion
                    )
                );
        }

        distribuirCantidad(
            ubicaciones: StockItem[],
            cantidad: number,
            st: string,
            sku: string,
            descripcion: string
        ): DistributionResult  {
        const resultado: PickingItem[] = [];
            let pendiente = cantidad;
            for(const ubicacion of ubicaciones){
                if(pendiente<=0){
                    break;
                }
                const tomar = Math.min(
                    pendiente,
                    ubicacion.stock
                );
                if(tomar>0){
                    ubicacion.stock -= tomar;
                    resultado.push({
                        st,
                        sku,
                        descripcion,
                        cantidad: tomar,
                        ubicacion: ubicacion.ubicacion
                    });
                    pendiente -= tomar;
                }
            }
            return{
            items:resultado,
            pendiente
            };
        }

    allocate(pedidos: OrderItem[],stock: StockItem[]): PickingProcessResult {
        const stockActualizado = stock.map(item => ({
            ...item
        }));
        const picking: PickingItem[] = [];
        const shortages: StockShortage[] = [];
        const stats: PickingStats = {
            pedidos: pedidos.length,
            lineas: 0,
            skuProcesados: 0,
            bultosSolicitados: 0,
            bultosAsignados: 0,
            faltantes: 0
        };

        for (const pedido of pedidos) {
            const ubicaciones =
                this.buscarUbicacionesPorSKU(
                    stockActualizado,
                    pedido.sku
                );
        const resultado =
            this.distribuirCantidad(
                ubicaciones,
                Number(pedido.bultos),
                pedido.st,
                pedido.sku,
                pedido.title
            );
        picking.push(...resultado.items);
            if (resultado.pendiente > 0) {
                shortages.push({
                    st: pedido.st,
                    sku: pedido.sku,
                    descripcion: pedido.title,
                    solicitado: Number(pedido.bultos),
                    asignado:
                        Number(pedido.bultos) - resultado.pendiente,
                    faltante: resultado.pendiente
                });
            }
            stats.bultosSolicitados += Number(pedido.bultos);
            stats.bultosAsignados += Number(pedido.bultos) - resultado.pendiente;
        }
        stats.lineas = picking.length;
        stats.skuProcesados = pedidos.length;
        stats.faltantes = shortages.length;
        
        return {
            picking,
            stockActualizado,
            shortages,
            stats
        };
    }

        private compararUbicaciones(a:string,b:string){
            const pa=a.split(".");
            const pb=b.split(".");
            if(pa[0]!==pb[0]){
                return pa[0].localeCompare(pb[0]);
            }
            for(let i=1;i<3;i++){
                const na=Number(pa[i]??0);
                const nb=Number(pb[i]??0);
                if(na!==nb){
                    return na-nb;
                }
            }
            return 0;
        }
    }

   

