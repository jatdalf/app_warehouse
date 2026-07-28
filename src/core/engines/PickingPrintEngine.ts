import type { PipelineStep } from "../pipeline/PeYaPipeline";
import type { EngineResult } from "../shared/EngineResult";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import { PickingPrintService } from "../../services/picking/PickingPrintService";

export class PickingPrintEngine
implements PipelineStep{
    readonly name="Imprimiendo Picking";
    async execute(
        session:WarehouseSession
    ):Promise<EngineResult>{
        PickingPrintService.imprimir(
            session.picking
        );
        return{
            success:true,
            message:"Picking enviado a impresión."
        };
    }
}