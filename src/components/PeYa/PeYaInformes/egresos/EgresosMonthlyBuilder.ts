import type { EgresoItem } from "./EgresoItem";
import type { FeriadoItem } from "../inventarios/FeriadoItem";
import { EgresosSummaryBuilder } from "./EgresosSummaryBuilder";

export interface EgresosMonthlyData {
    key: string;
    mes: string;
    year: number;
    month: number;
    normal: number;
    especial: number;
    total: number;
}

export class EgresosMonthlyBuilder {
    static build(items: EgresoItem[], feriados: FeriadoItem[]): EgresosMonthlyData[] {
        const grupos = new Map<string, EgresoItem[]>();
        for (const item of items) {
            if (Number.isNaN(item.fecha.getTime())) {
                continue;
            }
            const year = item.fecha.getFullYear();
            const month = item.fecha.getMonth();
            const key = `${year}-${month}`;
            if (!grupos.has(key)) {
                grupos.set(key, []);
            }
            grupos.get(key)!.push(item);
        }

        return [...grupos.entries()].map(([key, grupo]) => {
            const fecha = grupo[0].fecha;
            const resumen = EgresosSummaryBuilder.build(grupo, feriados);
            const mesRaw = new Intl.DateTimeFormat("es-AR", {month: "short"}).format(fecha).replace(".", "");
            const mes = mesRaw.charAt(0).toUpperCase() + mesRaw.slice(1);
            return {
                key,
                mes,
                year: fecha.getFullYear(),
                month: fecha.getMonth(),
                normal: resumen.bultosNormal,
                especial: resumen.bultosEspecial,
                total: resumen.bultos
            };
        }).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    }
}