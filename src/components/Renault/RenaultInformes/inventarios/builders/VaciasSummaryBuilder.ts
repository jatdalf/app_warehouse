import type { VaciasItem } from "../vacias/VaciasItem";

export interface VaciasDetalle {
    fecha: Date;
    totalUbicaciones: number;
    ok: number;
    intruso: number;
    porcentajeOk: number;
    porcentajeIntruso: number;
}

export interface VaciasSummary {
    lineas: VaciasDetalle[];
    totalUbicaciones: number;
    totalOk: number;
    totalIntruso: number;
    porcentajeOk: number;
    porcentajeIntruso: number;
}

export class VaciasSummaryBuilder {
    static build(items: VaciasItem[]): VaciasSummary {
        const dias = new Map<string, VaciasItem>();

for (const item of items) {
    const fecha = new Date(
        item.fecha.getFullYear(),
        item.fecha.getMonth(),
        item.fecha.getDate(),
    );

    const clave = [
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
    ].join("-");

    const dia = dias.get(clave) ?? {
        fecha,
        relevadas: 0,
        ocupado: 0,
    };

    dia.relevadas += item.relevadas;
    dia.ocupado += item.ocupado;

    dias.set(clave, dia);
}

const lineas = [...dias.values()].sort((a, b) => a.fecha.getTime() - b.fecha.getTime()).map(item => {
            const ok = item.relevadas - item.ocupado;
            const porcentajeOk = item.relevadas > 0 ? ok / item.relevadas * 100 : 0;
            const porcentajeIntruso = item.relevadas > 0 ? item.ocupado / item.relevadas * 100 : 0;
            return {
                fecha: item.fecha,
                totalUbicaciones: item.relevadas,
                ok,
                intruso: item.ocupado,
                porcentajeOk,
                porcentajeIntruso
            };
        });

        const totalUbicaciones = lineas.reduce((total, item) => total + item.totalUbicaciones, 0);
        const totalOk = lineas.reduce((total, item) => total + item.ok, 0);
        const totalIntruso = lineas.reduce((total, item) => total + item.intruso, 0);
        const porcentajeOk = totalUbicaciones > 0 ? totalOk / totalUbicaciones * 100 : 0;
        const porcentajeIntruso = totalUbicaciones > 0 ? totalIntruso / totalUbicaciones * 100 : 0;

        return {
            lineas,
            totalUbicaciones,
            totalOk,
            totalIntruso,
            porcentajeOk,
            porcentajeIntruso
        };
    }
}