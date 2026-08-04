import type { PipelineStep } from "../pipeline/PeYaPipeline";
import type { EngineResult } from "../shared/EngineResult";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import { StockAllocator } from "../stock/StockAllocator";
import { PickingStrategyFactory } from "../picking/strategies/PickingStrategyFactory";

export class PickingEngine implements PipelineStep {
    readonly name = "Generando Picking";
    async execute(session: WarehouseSession): Promise<EngineResult> {
    const strategy = PickingStrategyFactory.create(session.pickingMethod);
    const allocator = new StockAllocator(strategy);
    const resultado = allocator.allocate(session.pedidos, session.stock);
    session.stock = resultado.stockActualizado;
    session.picking = resultado.picking;
    session.shortages = resultado.shortages;
    session.stats = resultado.stats;
    return {
        success: true,
        message: `Picking generado (${resultado.picking.length} líneas`
    };
    }
}