import type { PipelineStep } from "../pipeline/PeYaPipeline";
import type { EngineResult } from "../shared/EngineResult";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import { StockAllocator } from "../stock/StockAllocator";

export class PickingEngine implements PipelineStep{
    readonly name="Generando Picking";
    async execute(session: WarehouseSession): Promise<EngineResult> {
        const allocator = new StockAllocator();
        const resultado = allocator.allocate(session.pedidos, session.stock);
        session.picking = resultado.picking;
        session.stock = resultado.stockActualizado;
        session.shortages = resultado.shortages;
        session.stats = resultado.stats;
        return {
            success: true,
            message: "Picking generado."
        };
    }
}