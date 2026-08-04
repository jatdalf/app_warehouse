import type { PipelineStep } from "../pipeline/PeYaPipeline";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import type { EngineResult } from "../shared/EngineResult";
import { RemitoFactory } from "../remitos/RemitoFactory";

export class RemitoEngine implements PipelineStep {
    readonly name = "Remitos";
    async execute(session: WarehouseSession): Promise<EngineResult> {
        session.remitos =
            RemitoFactory.build(session.picking);
        return {
            success: true,
            message:`${session.remitos.length} remitos generados.`
        };
    }
}