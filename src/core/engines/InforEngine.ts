import { generarMovimientosInfor } from "../../services/inforMovimientos";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import type { EngineResult } from "../shared/EngineResult";
import type { PipelineStep } from "../pipeline/PeYaPipeline";

export class InforEngine implements PipelineStep {

    readonly name = "Generando movimientos Infor";

    async execute(session: WarehouseSession): Promise<EngineResult> {
        try {
            session.movimientos = generarMovimientosInfor(session.picking);
            return {
                success: true,
                message: "Movimientos Infor generados."
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Error generando movimientos Infor."
            };
        }
    }
}