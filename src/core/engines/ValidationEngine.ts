import type { PipelineStep } from "../pipeline/PeYaPipeline";
import type { EngineResult } from "../shared/EngineResult";
import { WarehouseSession } from "../warehouse/WarehouseSession";



export class ValidationEngine implements PipelineStep {
    readonly name = "Validación";
    private validarStock(session: WarehouseSession): EngineResult | null {
        if (session.stock.length === 0) {
            return {
                success: false,
                message: "No hay stock cargado."
            };
        }
        return null;
    }
    private validarPedidos(session: WarehouseSession): EngineResult | null {
        if (session.pedidos.length === 0) {
            return {
                success: false,
                message: "No hay pedidos cargados."
            };
        }
        return null;
    }

async execute(
    session: WarehouseSession): Promise<EngineResult> {
        const stock = this.validarStock(session);
        if (stock) {
            return stock;
        }
        const pedidos = this.validarPedidos(session);
        if (pedidos) {
            return pedidos;
        }
        return {
            success: true,
            message: "Validación OK."
        };
    }
}