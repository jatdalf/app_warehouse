import type { PipelineStep } from "../pipeline/PeYaPipeline";
import type { EngineResult } from "../shared/EngineResult";
import { WarehouseSession } from "../warehouse/WarehouseSession";

import { RemitoFactory } from "../remitos/RemitoFactory";
import { RemitoPrintService } from "../../services/remito/RemitoPrintService"

export class RemitoPrintEngine
implements PipelineStep {

    readonly name = "Imprimiendo Remitos";

    async execute(
        session: WarehouseSession
    ): Promise<EngineResult> {

        const remitos =
            RemitoFactory.build(
                session.picking
            );

        RemitoPrintService.imprimir(
            remitos
        );

        return {
            success: true,
            message: "Remitos enviados a impresión."
        };

    }

}