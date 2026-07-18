import { generarSalidaInfor } from "../../services/inforExcel";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import type { EngineResult } from "../shared/EngineResult";
import type { PipelineStep } from "../pipeline/PeYaPipeline";



export class InforEngine
implements PipelineStep{

    readonly name="Generando archivo Infor";

    async execute(session:WarehouseSession):Promise<EngineResult>{
        try{
            await generarSalidaInfor(session.pedidos);
            return{
                success:true,
                message:"Archivo Infor generado."
            };
        }catch(error){
            return{
                success:false,
                message:error instanceof Error
                    ? error.message
                    : "Error generando Infor."
            };
        }
    }
}