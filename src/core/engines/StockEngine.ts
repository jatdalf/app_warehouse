import type { PipelineStep } from "../pipeline/PeYaPipeline";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import type { EngineResult } from "../shared/EngineResult";

export class StockEngine implements PipelineStep {

    readonly name = "StockEngine";

    async execute(
        _session: WarehouseSession
    ): Promise<EngineResult> {
        return {
            success: true,
            message: "StockEngine."            
        };
    }    
}