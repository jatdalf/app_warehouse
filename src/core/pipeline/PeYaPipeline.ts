import { WarehouseSession } from "../warehouse/WarehouseSession";
import type { EngineResult } from "../shared/EngineResult";

export interface PipelineStep{
    readonly name:string;
    execute(session:WarehouseSession):Promise<EngineResult>;
}

export class PeYaPipeline{
    private readonly steps: PipelineStep[];

    constructor(steps: PipelineStep[]){
        this.steps = steps;
    }

    async execute(
        session: WarehouseSession,
        onStep?:(step:string)=>void
    ):Promise<EngineResult>{

        for(const step of this.steps){
            onStep?.(step.name);
            const result = await step.execute(session);
            if(!result.success){
                return result;
            }
        }

        return{
            success:true,
            message:"Proceso completado."
        };

    }
}