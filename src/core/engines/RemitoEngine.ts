import type { PipelineStep } from "../pipeline/PeYaPipeline";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import type { EngineResult } from "../shared/EngineResult";

export class RemitoEngine implements PipelineStep {

    readonly name = "Remitos";

    async execute(
        session: WarehouseSession
    ): Promise<EngineResult> {
        return {
            success: true,
            message: "Remitos pendientes."
        };
        console.log(session)
    }
    
}