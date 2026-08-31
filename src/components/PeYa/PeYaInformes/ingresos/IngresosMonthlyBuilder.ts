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
        /* 1. Agrupamos los ingresos existentes */
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
        const hoy = new Date();
        const currentYear = hoy.getFullYear();
        const currentMonth = hoy.getMonth();
        /*
         * 3. Determinamos desde qué año comenzar.
         *
         * Usamos el año más antiguo presente
         * en los datos.
         */
        const fechasValidas = items.map(item => item.dateReceived).filter(
                    fecha => fecha && !Number.isNaN(fecha.getTime()));
        if (fechasValidas.length === 0) {
            return [];
        }

        const resultado: IngresoMonthlyData[] = [];
        const primeraFecha = fechasValidas.reduce((menor, fecha) => fecha < menor ? fecha : menor);
        const firstYear = primeraFecha.getFullYear();
        const firstMonth = primeraFecha.getMonth();
        
        for (let year = firstYear; year <= currentYear; year++) {
            const startMonth = year === firstYear ? firstMonth : 0;
            const lastMonth = year === currentYear ? currentMonth : 11;
            for (let month = startMonth; month <= lastMonth; month++) {
                const key = `${year}-${month}`;
                const grupo = grupos.get(key) ?? [];
                const summary = IngresosSummaryBuilder.build(grupo);
                const fecha = new Date(year, month, 1);
                const mesTexto = new Intl.DateTimeFormat("es-AR", {month: "short"}).format(fecha);
                const mes = mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1);
                resultado.push({key, mes, year, month, sku: summary.sku, unidades: summary.unidades, pallets: summary.pallets});
            }
        }
        return resultado;
    }
}