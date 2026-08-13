import type { InventarioItem } from "./InventarioItem";
import type { FeriadoItem } from "./FeriadoItem";
import { CalendarioLaboral } from "./CalendarioLaboral";

export interface InventarioSummary {
    realizados: number;
    sinDiferencias: number;
    conDiferencias: number;
    esperados: number;
    cumplimiento: number;
    diasLaborables: number;
}

export class InventarioSummaryBuilder {
    static build(
        inventarios: InventarioItem[],
        feriados: FeriadoItem[],
        desde: Date,
        hasta: Date,
        fechaCorte?: Date | null
    ): InventarioSummary {
        /*No permitimos exigir fechas futuras.*/
        const limite = fechaCorte ?? hasta;
        const finReal = hasta.getTime() > limite.getTime() ? limite : hasta;
        /*
         * Los realizados se cuentan por fecha
         * independientemente de si fueron hechos
         * sábado, domingo o feriado.
         */
        const realizadosPeriodo = inventarios.filter(item =>
            item.fecha >= desde && item.fecha <= this.finDelDia(finReal)
        );

        const realizados = realizadosPeriodo.length;
        /*
         * Por ahora conocemos como "sin diferencia"
         * este resultado.
         */
        const sinDiferencias = realizadosPeriodo.filter( item => item.resultado
            .toLowerCase().includes("recuento igual")).length;

        const conDiferencias = realizados - sinDiferencias;
        const diasLaborables = CalendarioLaboral.diasLaborables(desde, finReal, feriados);
        const esperados = diasLaborables * 10;
        const cumplimiento = esperados > 0 ? (realizados / esperados) * 100 : 0;

        return {
            realizados,
            sinDiferencias,
            conDiferencias,
            esperados,
            cumplimiento: Math.round(cumplimiento * 10) / 10,
            diasLaborables
        };
    }

    private static finDelDia(fecha: Date): Date {
        return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
    }
}