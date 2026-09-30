import type { WarehouseInventario } from "../../InventarioWarehouseConfig";
import type { MetodoPlanificacion } from "../components/PlanificacionMethodSelector";

export interface PlanificacionPosicion {
    storage: string;
    ubicacion: string;
    material: string;
}
interface GuardarPlanificacionParams {
    warehouse: WarehouseInventario;
    fecha: string;
    targetDiario: number;
    tipoPlanificacion: MetodoPlanificacion;
    posiciones: PlanificacionPosicion[];
    usuario: string;
}
interface GuardarPlanificacionResponse {
    success: boolean;
    idPlan: string;
    cantidad: number;
    accion: "creada" | "actualizada";
    error?: string;
}
export interface ObtenerPlanificacionResponse {
    success: boolean;
    existe: boolean;
    idPlan: string;
    warehouse: WarehouseInventario;
    fecha: string;
    targetDiario: number | null;
    tipoPlanificacion: MetodoPlanificacion | null;
    usuario: string;
    posiciones: PlanificacionPosicion[];
}

export class InventarioPlanificacionService {
    static async guardar(params: GuardarPlanificacionParams): Promise<GuardarPlanificacionResponse> {
        const response = await fetch("/api/guardar-planificacion-inventario",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(params)
            }
        );
        const textoRespuesta = await response.text();
        if (!textoRespuesta) {
            throw new Error(
                `El servidor respondió ${response.status} pero no devolvió contenido.`
            );
        }
        let data: GuardarPlanificacionResponse;
        try {
            data = JSON.parse(textoRespuesta);
        } catch {
            throw new Error(`El servidor no devolvió JSON válido. Status: ${response.status}`);
        }
        if (!response.ok || !data.success) {
            throw new Error(data.error ?? "No fue posible guardar la planificación.");
        }
        return data;
    }
    static async obtener(warehouse: WarehouseInventario, fecha: string): Promise<ObtenerPlanificacionResponse> {
        const response = await fetch("/api/obtener-planificacion-inventario",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({warehouse, fecha})
            }
        );
        const textoRespuesta = await response.text();
        if (!textoRespuesta) {
            throw new Error(`El servidor respondió ${response.status} pero no devolvió contenido.`);
        }
        let data: ObtenerPlanificacionResponse;
        try {
            data = JSON.parse(textoRespuesta);
        } catch {
            throw new Error(`El servidor no devolvió JSON válido. Status: ${response.status}`);
        }
        if (!response.ok || !data.success) {
            throw new Error((data as ObtenerPlanificacionResponse & {error?: string;}).error ??
                "No fue posible obtener la planificación."
            );
        }
        return data;
    }
}