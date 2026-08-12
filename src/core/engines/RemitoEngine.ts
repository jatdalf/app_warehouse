import type { PipelineStep } from "../pipeline/PeYaPipeline";
import { WarehouseSession } from "../warehouse/WarehouseSession";
import type { EngineResult } from "../shared/EngineResult";
import { RemitoFactory } from "../remitos/RemitoFactory";
import { obtenerRemitos } from "../../services/remitos";

interface RemitoAsignado {
    st: string;
    remito: string;
}

export class RemitoEngine implements PipelineStep {
    readonly name = "Remitos";    
    async execute(session: WarehouseSession): Promise<EngineResult> {
        const sts = [...new Set(session.picking.map(item => item.st))];
        const numeros = new Map<string, string>();
        let numeracionProvisoria = false;
        try {
            const remitos = await obtenerRemitos(sts, "Jorge") as RemitoAsignado[];
            for (const item of remitos) {
                numeros.set(item.st, item.remito);
            }
        } catch (error) {
            console.error("No fue posible obtener numeración de remitos:", error);
            numeracionProvisoria = true;
        }
        // Garantiza que TODOS los ST tengan número.
        sts.forEach((st, index) => {
            if (numeros.has(st)) {
                return;
            }
            numeracionProvisoria = true;
            const numeroFallback = (99990001 + index).toString().padStart(8, "0");
            numeros.set(st, numeroFallback);
        });
        session.remitos = RemitoFactory.build(session.picking, numeros);
        session.remitoNumeracionProvisoria = numeracionProvisoria;
        return {
            success: true,
            message: numeracionProvisoria
                ? `${session.remitos.length} remitos generados con numeración provisoria.`
                : `${session.remitos.length} remitos generados.`
        };
    }
}