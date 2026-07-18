import type { PipelineStep } from "../pipeline/PeYaPipeline";
import type { EngineResult } from "../shared/EngineResult";
import { WarehouseSession } from "../warehouse/WarehouseSession";

export class PickingEngine implements PipelineStep{

    readonly name="Generando Picking";

    async execute(
        session: WarehouseSession
    ):Promise<EngineResult>{

        console.log(session.pedidos);
        console.log(session.stock);

        return{
            success:true,
            message:"Picking generado."
        };

    }

}