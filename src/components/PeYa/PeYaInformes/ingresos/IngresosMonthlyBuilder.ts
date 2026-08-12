import type { IngresoItem } from "./IngresoItem";
import { IngresosSummaryBuilder } from "./IngresosSummaryBuilder";

export interface IngresoMonthlyData {
    key: string;
    mes: string;
    year: number;
    month: number;
    sku: number;
    unidades: number;
    pallets: number;
}

export class IngresosMonthlyBuilder {
    static build(items: IngresoItem[]): IngresoMonthlyData[] {

        const grupos = new Map<string, IngresoItem[]>();

        for (const item of items) {
            const fecha = item.dateReceived;
            if (!fecha || Number.isNaN(fecha.getTime())) {
                continue;
            }

            const year = fecha.getFullYear();
            const month = fecha.getMonth();
            const key = `${year}-${month}`;

            if (!grupos.has(key)) {
                grupos.set(key, []);
            }

            grupos.get(key)!.push(item);
        }

        return [...grupos.entries()]
            .map(([key, grupo]) => {

                const fecha = grupo[0].dateReceived;
                const summary = IngresosSummaryBuilder.build(grupo);
                const mesTexto = new Intl.DateTimeFormat("es-AR",{month: "short"}).format(fecha);
                const mes = mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1);

                return {
                    key,
                    mes,
                    year: fecha.getFullYear(),
                    month: fecha.getMonth(),
                    sku: summary.sku,
                    unidades: summary.unidades,
                    pallets: summary.pallets
                };
            })

            .sort((a, b) => {
                if (a.year !== b.year) {
                    return a.year - b.year;
                }
                return a.month - b.month;
            });
    }
}