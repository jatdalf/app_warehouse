import type { OcupacionItem } from "./OcupacionItem";

export interface OcupacionSummary {
    posicionesActuales: number;
    skuActuales: number;
    promedioPosiciones: number;
    maximoPosiciones: number;
    diasExceso: number;
    promedioSobrecapacidad: number;}

export class OcupacionSummaryBuilder {
    static build(items: OcupacionItem[]): OcupacionSummary {
        if (items.length === 0) {
            return {
                posicionesActuales: 0,
                skuActuales: 0,
                promedioPosiciones: 0,
                maximoPosiciones: 0,
                diasExceso: 0,
                promedioSobrecapacidad: 0
            };
        }

        const ordenados = [...items].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        const ultimo = ordenados[ordenados.length - 1];
        const promedioPosiciones = Math.round(items.reduce((acc, item) => acc + item.posiciones, 0) / items.length);
        const maximoPosiciones = Math.max( ...items.map(item => item.posiciones));
        const diasExceso = items.filter( item => item.posiciones > 100).length;
        const totalSobrecapacidad = items.reduce((acc, item) => acc + Math.max(item.posiciones - 100, 0), 0);
        const promedioSobrecapacidad = Math.round(totalSobrecapacidad / items.length);

        return {
            posicionesActuales: ultimo.posiciones,
            skuActuales: ultimo.sku,
            promedioPosiciones,
            maximoPosiciones,
            diasExceso,
            promedioSobrecapacidad
        };
    }
}