import type { EgresoItem } from "./EgresoItem";
import type { FeriadoItem } from "../inventarios/FeriadoItem";
import { CalendarioLaboral } from "../inventarios/CalendarioLaboral";
import { EgresoBillingCalendar } from "./EgresoBillingCalendar";

export interface EgresosSummary {
    ordenes: number;
    sku: number;
    bultos: number;
    bultosNormal: number;
    bultosEspecial: number;
}

export class EgresosSummaryBuilder {
    static build(items: EgresoItem[], feriados: FeriadoItem[]): EgresosSummary {
        const ordenes = new Set(items.map(item => item.st)).size;
        const sku = new Set(items.map(item => `${item.st}|${item.sku}`)).size;
        const bultos = items.reduce((acc, item) => acc + item.bultos, 0);
        let bultosNormal = 0;
        let bultosEspecial = 0;
        for (const item of items) {
        const fechaEntrega = EgresoBillingCalendar.fechaEntrega(item.fecha);
        const esDomingo = fechaEntrega.getDay() === 0;
        const esFeriado = CalendarioLaboral.esFeriado(fechaEntrega, feriados);
        const esEspecial = esDomingo || esFeriado;
            if (esEspecial) {
                bultosEspecial += item.bultos;
            } else {
                bultosNormal += item.bultos;
            }
        }
        return {
            ordenes,
            sku,
            bultos,
            bultosNormal,
            bultosEspecial
        };
    }
}