import type { EngineResult } from "../shared/EngineResult";
import type { PipelineStep } from "../pipeline/PeYaPipeline";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import { buscarUbicacionesPorSKU } from "../stock/StockAllocator";
import { distribuirCantidad } from "../stock/StockAllocator";

export class PickingEngine implements PipelineStep{
    readonly name="Generando Picking";
    async execute(session:WarehouseSession):Promise<EngineResult>{
        session.picking=[];
        for(const pedido of session.pedidos){
            const ubicaciones=
                buscarUbicacionesPorSKU(
                    session.stock,
                    pedido.sku
                );
            const resultado=
                distribuirCantidad(
                    ubicaciones,
                    Number(pedido.bultos),
                    pedido.st,
                    pedido.sku,
                    pedido.title
                );
            session.picking.push(
                ...resultado.items
            );
        }
        return{
            success:true,
            message:"Picking generado."
        };
    }
}